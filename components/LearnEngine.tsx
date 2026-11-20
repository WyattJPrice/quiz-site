'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Check, X, SlidersHorizontal } from 'lucide-react';
import type { Question } from '@/data/types';
import { shuffle, normalize, isFuzzyMatch, getPermutations } from '@/lib/quiz';
import { generateChoices, getCorrectAnswer } from '@/lib/learn-algorithm';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  addKnownIndex,
  getKnownIndices,
  sanitizeLearnSession,
} from '@/lib/learn-storage';
import { pullSession, pushSession, dropSession } from '@/lib/session-sync';
import type { LearnSessionState } from '@/lib/learn-types';
import { authClient, signInWithGoogle } from '@/lib/session';
import { getTrendSymbols } from '@/lib/periodic-table';
import PeriodicTableMini from '@/components/PeriodicTableMini';
import { Button } from '@/components/ui/button';

interface Props {
  questions: Question[];
  slug: string;
}

export default function LearnEngine({ questions, slug }: Props) {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<LearnSessionState | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [choiceResult, setChoiceResult] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [answered, setAnswered] = useState(false);
  const [cardClass, setCardClass] = useState('');
  const [complete, setComplete] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);

  // Fill-in-blank state
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [inputStates, setInputStates] = useState<('neutral' | 'correct' | 'wrong')[]>([]);
  const [reveals, setReveals] = useState<boolean[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Filter sidebar
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: authSession, isPending: sessionPending } = authClient.useSession();

  // Saved-session hydration: local copy first, then the copy on the profile
  const [syncReady, setSyncReady] = useState(false);
  const pulled = useRef(false);
  const localSavedAt = useRef(0);

  const allCats = useMemo(
    () => Array.from(new Set(questions.map((q) => q.cat))),
    [questions]
  );
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    questions.forEach((q) => { m[q.cat] = (m[q.cat] ?? 0) + 1; });
    return m;
  }, [questions]);
  const filteredCount = useMemo(
    () => questions.filter((q) => selectedCats.has(q.cat)).length,
    [questions, selectedCats]
  );

  // Every answer this set teaches, normalized — lets grading tell a misspelling
  // apart from a term the student mixed up
  const knownTerms = useMemo(() => {
    const terms = new Set<string>();
    questions.forEach((item) => {
      item.answer.split(',').forEach((blank) =>
        blank.split('/').forEach((opt) => terms.add(normalize(opt)))
      );
      item.choices?.forEach((choice) => terms.add(normalize(choice)));
    });
    return terms;
  }, [questions]);

  // True on the first selectedCats effect run so we can restore saved progress
  const isInitialMount = useRef(true);

  function filteredIndices(cats: Set<string>): number[] {
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => cats.has(q.cat))
      .map(({ i }) => i);
  }

  function makeFreshSession(cats: Set<string>): LearnSessionState {
    const indices = filteredIndices(cats);
    return {
      slug,
      remaining: shuffle(indices),
      wrongPile: [],
      currentIdx: 0,
      round: 1,
      totalCorrect: 0,
      totalWrong: 0,
      categories: [...cats],
      totalQuestions: indices.length,
    };
  }

  /** Saves to this device and, when signed in, to the student's profile. */
  function persist(state: LearnSessionState): void {
    const stamped = { ...state, updatedAt: Date.now() };
    saveProgress(stamped);
    localSavedAt.current = stamped.updatedAt ?? 0;
    if (authSession?.user) pushSession(slug, 'learn', stamped);
  }

  /** Adopts a round saved on the profile (another device is further along). */
  function applySaved(state: LearnSessionState): void {
    setSession(state);
    saveProgress(state);
    localSavedAt.current = state.updatedAt ?? 0;
    loadQuestion(state);
    setComplete(false);
  }

  // Initial mount — restore the saved round's categories when we have them, so
  // the filter matches the questions actually being studied (triggers the
  // session effect below)
  useEffect(() => {
    const saved = sanitizeLearnSession(loadProgress(slug), slug, questions.length);
    const savedCats = saved?.categories?.filter((cat) => allCats.includes(cat));
    setSelectedCats(new Set(savedCats && savedCats.length > 0 ? savedCats : allCats));
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build/rebuild session when selected categories change
  useEffect(() => {
    if (selectedCats.size === 0) {
      setSession(null);
      setComplete(false);
      return;
    }

    let state: LearnSessionState;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const existing = sanitizeLearnSession(loadProgress(slug), slug, questions.length);
      if (existing) {
        // Resume the local round without re-stamping it, so a newer copy from
        // another device still wins when the profile is pulled below
        state = existing;
        saveProgress(state);
        localSavedAt.current = state.updatedAt ?? 0;
      } else {
        state = makeFreshSession(selectedCats);
        saveProgress(state);
      }
    } else {
      state = makeFreshSession(selectedCats);
      persist(state);
    }

    setSession(state);
    loadQuestion(state);
    setComplete(false);
  }, [selectedCats]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pull the round saved on the student's profile, so a session started on one
  // device continues on another
  useEffect(() => {
    if (!mounted || pulled.current) return;
    if (sessionPending) {
      // Never leave the set blank if the session lookup stalls
      const fallback = setTimeout(() => {
        if (!pulled.current) {
          pulled.current = true;
          setSyncReady(true);
        }
      }, 3000);
      return () => clearTimeout(fallback);
    }
    pulled.current = true;

    if (!authSession?.user) {
      setSyncReady(true);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    pullSession(slug, 'learn', controller.signal)
      .then((raw) => {
        const remote = sanitizeLearnSession(raw, slug, questions.length);
        if (!remote) return;
        if ((remote.updatedAt ?? 0) <= localSavedAt.current) return;
        applySaved(remote);
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setSyncReady(true);
      });
  }, [mounted, sessionPending, authSession, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingAdvance) {
      setPendingAdvance(false);
      advance();
    }
  }, [pendingAdvance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remind to sign in after finishing a full study session, and sync progress
  useEffect(() => {
    if (!complete) return;
    const signedIn = !!authSession?.user;
    if (signedIn && session) {
      if (session.totalCorrect + session.totalWrong > 0) {
        try {
          fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug,
              kind: 'learn',
              knownIndices: getKnownIndices(slug),
            }),
          }).catch(() => {});
        } catch {
          // ignore
        }
      }
    }
    if (!signedIn) {
      toast('Sign in to save your progress across devices.', {
        position:
          window.innerWidth >= 640 ? 'bottom-right' : 'bottom-center',
        action: {
          label: 'Sign in with Google',
          onClick: () => signInWithGoogle().catch(() => {}),
        },
      });
    }
  }, [complete]); // eslint-disable-line react-hooks/exhaustive-deps

  function loadQuestion(state: LearnSessionState) {
    const qIdx = state.remaining[state.currentIdx];
    if (qIdx === undefined) return;
    const q = questions[qIdx];
    if (q.choices) {
      setChoices(generateChoices(q, questions));
    }
    setChoiceResult({});
    setAnswered(false);
    setCardClass('');
    const parts = q.choices ? [] : q.answer.split(',');
    setInputValues(parts.map(() => ''));
    setInputStates(parts.map((): 'neutral' | 'correct' | 'wrong' => 'neutral'));
    setReveals(parts.map(() => false));
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  function markAnswer(isCorrect: boolean) {
    if (!session) return;
    const qIdx = session.remaining[session.currentIdx];
    const updated = { ...session };
    if (isCorrect) {
      updated.totalCorrect++;
      addKnownIndex(slug, qIdx);
    } else {
      updated.totalWrong++;
      updated.wrongPile = [...updated.wrongPile, qIdx];
    }
    setSession(updated);
    persist(updated);
  }

  function handleChoice(choice: string) {
    if (answered || !session) return;
    setAnswered(true);

    const qIdx = session.remaining[session.currentIdx];
    const q = questions[qIdx];
    const correct = getCorrectAnswer(q);
    const isCorrect = choice.toLowerCase().trim() === correct.toLowerCase().trim();

    const results: Record<string, 'correct' | 'wrong'> = {};
    if (isCorrect) {
      results[choice] = 'correct';
      setCardClass('correct-state pop');
    } else {
      results[choice] = 'wrong';
      results[correct] = 'correct';
      setCardClass('wrong-state shake');
    }
    setChoiceResult(results);
    markAnswer(isCorrect);

    if (isCorrect) {
      setTimeout(() => setPendingAdvance(true), 900);
    }
  }

  function handleSubmitInput() {
    if (answered || !session) return;

    const qIdx = session.remaining[session.currentIdx];
    const q = questions[qIdx];
    const answers = q.answer.split(',');
    const userVals = answers.map((_, i) => inputValues[i] ?? '');
    if (userVals.every((v) => !v.trim())) return;
    setAnswered(true);

    const swapped =
      answers.length > 1 &&
      getPermutations(userVals).some(
        (perm) =>
          perm.join('|') !== userVals.join('|') &&
          perm.every((val, i) => {
            const opts = answers[i].split('/');
            return (
              opts.map((o) => normalize(o)).includes(normalize(val)) ||
              isFuzzyMatch(val, opts, knownTerms)
            );
          })
      );

    const newStates: ('neutral' | 'correct' | 'wrong')[] = [];
    const newReveals: boolean[] = [];
    const fuzzyParts: { wrote: string; correct: string }[] = [];
    let allCorrect = true;

    answers.forEach((ans, i) => {
      const opts = ans.split('/');
      const exact = opts.map((o) => normalize(o)).includes(normalize(userVals[i]));
      const fuzzy = !exact && isFuzzyMatch(userVals[i], opts, knownTerms);
      const right = exact || fuzzy || swapped;
      if (fuzzy && !swapped) {
        fuzzyParts.push({ wrote: userVals[i], correct: opts[0] });
      }
      newStates.push(right ? 'correct' : 'wrong');
      newReveals.push(!right);
      if (!right) allCorrect = false;
    });

    setInputStates(newStates);
    setReveals(newReveals);

    if (allCorrect) {
      setCardClass('correct-state pop');
    } else {
      setCardClass('wrong-state shake');
    }
    markAnswer(allCorrect);

    if (allCorrect) {
      if (fuzzyParts.length > 0) {
        toast.success('Close enough — marked correct', {
          description: fuzzyParts.map((part) => (
            <span key={part.wrote} className="block">
              You wrote <strong>“{part.wrote}”</strong> — the correct spelling is{' '}
              <strong>“{part.correct}”</strong>
            </span>
          )),
          duration: 3000,
        });
      }
      setTimeout(() => setPendingAdvance(true), 900);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number,
    total: number
  ) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (answered) {
      advance();
      return;
    }
    if (total > 1 && i < total - 1) {
      inputRefs.current[i + 1]?.focus();
      inputRefs.current[i + 1]?.select();
      return;
    }
    handleSubmitInput();
  }

  function advance() {
    if (!session) return;

    const nextIdx = session.currentIdx + 1;

    if (nextIdx >= session.remaining.length) {
      if (session.wrongPile.length === 0) {
        setComplete(true);
        resetProgress(slug);
        dropSession(slug, 'learn');
        localSavedAt.current = 0;
        return;
      }
      const newSession: LearnSessionState = {
        ...session,
        remaining: shuffle(session.wrongPile),
        wrongPile: [],
        currentIdx: 0,
        round: session.round + 1,
      };
      setSession(newSession);
      persist(newSession);
      loadQuestion(newSession);
      return;
    }

    const updated = { ...session, currentIdx: nextIdx };
    setSession(updated);
    persist(updated);
    loadQuestion(updated);
  }

  function handleReset() {
    resetProgress(slug);
    const fresh = makeFreshSession(selectedCats);
    setSession(fresh);
    persist(fresh);
    loadQuestion(fresh);
    setComplete(false);
  }

  function toggleCat(cat: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  if (!mounted || !syncReady) return null;

  // ── Sidebar ──────────────────────────────────────────────────────
  const sidebar = (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/45" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`fixed top-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-border bg-card shadow-lg transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <span className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Categories
          </span>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex gap-2 border-b border-border px-5 py-2.5">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedCats(new Set(allCats))}>
            All
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedCats(new Set())}>
            None
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {allCats.map((cat) => (
            <div
              key={cat}
              className="flex cursor-pointer items-center gap-2.5 px-5 py-2.5 text-[13px] hover:bg-accent select-none"
              onClick={() => toggleCat(cat)}
            >
              <span
                className={`flex size-4 flex-shrink-0 items-center justify-center border ${
                  selectedCats.has(cat) ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {selectedCats.has(cat) && <Check className="size-2.5 text-white" strokeWidth={3.5} />}
              </span>
              <span className={`flex-1 truncate ${selectedCats.has(cat) ? '' : 'text-muted-foreground'}`}>
                {cat}
              </span>
              <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground">
                {catCounts[cat]}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
          <strong className="text-foreground">{filteredCount}</strong> / {questions.length} questions active
        </div>
      </div>
    </>
  );

  // ── Filter bar ───────────────────────────────────────────────────
  const filterBar = (
    <div className="mb-4">
      <Button variant="outline" size="sm" className="text-xs" onClick={() => setSidebarOpen(true)}>
        <SlidersHorizontal className="size-3.5" />
        Categories
        {selectedCats.size < allCats.length && allCats.length > 0 && (
          <span className="ml-1 inline-flex h-4 items-center rounded-full bg-primary px-1.5 text-[10px] leading-none font-bold text-primary-foreground">
            {selectedCats.size} / {allCats.length}
          </span>
        )}
      </Button>
    </div>
  );

  // No categories selected
  if (!session || selectedCats.size === 0) {
    return (
      <>
        {sidebar}
        {filterBar}
        <div className="border border-border bg-card p-16 text-center shadow-xs">
          <p className="text-muted-foreground">No categories selected.</p>
          <Button className="mt-4" onClick={() => setSelectedCats(new Set(allCats))}>
            Select All
          </Button>
        </div>
      </>
    );
  }

  if (complete) {
    return (
      <>
        {sidebar}
        <div className="border border-border bg-card p-12 text-center shadow-xs sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight">All questions correct!</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Finished in {session.round} round{session.round > 1 ? 's' : ''} with {session.totalCorrect} correct and {session.totalWrong} wrong answers total.
          </p>
          <div className="mt-9 mb-9 flex justify-center gap-10">
            <div>
              <span className="block text-4xl font-medium tabular-nums text-correct">
                {session.totalQuestions ?? filteredCount}
              </span>
              <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Questions</span>
            </div>
            <div>
              <span className="block text-4xl font-medium tabular-nums text-primary">{session.round}</span>
              <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Rounds</span>
            </div>
          </div>
          <div className="mt-9 flex justify-center gap-3">
            <Button onClick={handleReset}>Study Again</Button>
            <Button variant="outline" onClick={() => setSidebarOpen(true)}>
              Change Categories
            </Button>
          </div>
        </div>
      </>
    );
  }

  const qIdx = session.remaining[session.currentIdx];
  if (qIdx === undefined) return null;
  const q = questions[qIdx];
  const isChoice = !!q.choices;
  const trendSymbols = getTrendSymbols(q.choices);
  const progressPct = (session.currentIdx / session.remaining.length) * 100;

  return (
    <>
      {sidebar}

      {filterBar}

      <div className="mb-7">
        <div className="mb-2.5 h-1 w-full overflow-hidden bg-border">
          <div className="h-full bg-correct transition-[width] duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Round {session.round} {session.wrongPile.length > 0 && `· ${session.wrongPile.length} wrong`}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {session.currentIdx + 1}/{session.remaining.length}
          </span>
        </div>
      </div>

      <div
        className={`relative border bg-card px-6 py-9 shadow-xs sm:px-10 sm:py-10 ${
          cardClass.includes('correct-state')
            ? 'border-correct'
            : cardClass.includes('wrong-state')
            ? 'border-wrong'
            : 'border-border'
        } ${cardClass}`}
        onAnimationEnd={() =>
          setCardClass((prev) => prev.replace(' pop', '').replace(' shake', ''))
        }
      >
        <div className="mb-4 inline-block border border-primary/30 px-2.5 py-1 text-[10px] tracking-[0.14em] text-primary uppercase">
          {q.cat}
        </div>
        <div className="mb-8 text-[21px] leading-normal font-semibold tracking-tight break-words sm:text-[22px]">
          {q.question.replace(/_{5,}/g, '_____')}
        </div>

        {trendSymbols && <PeriodicTableMini symbols={trendSymbols} />}

        {isChoice ? (
          <>
            <div className="mb-2.5 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Choose one:</div>
            <div>
              {choices.map((choice, i) => {
                const r = choiceResult[choice];
                const cls =
                  r === 'correct'
                    ? 'border-correct bg-correct/10 text-correct'
                    : r === 'wrong'
                    ? 'border-wrong bg-wrong/10 text-wrong'
                    : 'border-border bg-background hover:border-muted-foreground/60 hover:bg-accent';
                return (
                  <button
                    key={`${choice}-${i}`}
                    className={`mb-2 w-full border px-4 py-3.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                    onClick={() => handleChoice(choice)}
                    disabled={answered}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mb-2.5 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {q.answer.includes(',') ? `Fill in all ${q.answer.split(',').length} blanks` : 'Your answer'}
            </div>
            <div className="mb-3">
              {q.answer.split(',').map((ans, i) => (
                <div key={i} className="mb-3">
                  <input
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    className={`blank-input ${inputStates[i] ?? 'neutral'}`}
                    placeholder={q.answer.includes(',') ? `Blank ${i + 1}` : 'Type your answer...'}
                    value={inputValues[i] ?? ''}
                    onChange={(e) =>
                      setInputValues((vals) => {
                        const v = [...vals];
                        v[i] = e.target.value;
                        return v;
                      })
                    }
                    onKeyDown={(e) => handleKeyDown(e, i, q.answer.split(',').length)}
                    disabled={answered}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <div
                    className={`mt-1.5 pl-1 text-[13px] text-correct transition-all ${
                      reveals[i] ? 'opacity-100' : '-translate-y-1 opacity-0'
                    }`}
                  >
                    ✓ {ans.split('/')[0]}
                  </div>
                </div>
              ))}
            </div>
            {!answered && (
              <div className="mt-7 flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleSubmitInput}
                  disabled={inputValues.every((v) => !v.trim())}
                >
                  Check
                </Button>
              </div>
            )}
          </>
        )}

        {answered && !isChoice && inputStates.some((s) => s === 'wrong') && (
          <div className="mt-7 flex gap-3">
            <Button className="flex-1" onClick={advance}>
              Continue
            </Button>
          </div>
        )}

        {answered && isChoice && choiceResult[Object.keys(choiceResult).find(k => choiceResult[k] === 'wrong') || ''] && (
          <div className="mt-7 flex gap-3">
            <Button className="flex-1" onClick={advance}>
              Continue
            </Button>
          </div>
        )}
      </div>

    </>
  );
}
