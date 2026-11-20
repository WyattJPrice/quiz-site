'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Check, X, SlidersHorizontal } from 'lucide-react';
import type { Question } from '@/data/types';
import { shuffle, normalize, isFuzzyMatch, getPermutations } from '@/lib/quiz';
import {
  loadQuizSession,
  saveQuizSession,
  clearQuizSession,
  sanitizeQuizSession,
  type QuizSession,
} from '@/lib/quiz-session';
import { pullSession, pushSession, dropSession } from '@/lib/session-sync';
import { authClient, signInWithGoogle } from '@/lib/session';
import { Button } from '@/components/ui/button';

type BlankState = 'neutral' | 'correct' | 'wrong';
type ChoiceResult = 'correct' | 'wrong' | undefined;

/**
 * Rebuilds a saved deck against the current question list. Returns null when the
 * saved state no longer matches the set, so the round starts fresh.
 */
function restoreDeck(
  saved: QuizSession,
  filtered: Question[],
  all: Question[]
): { deck: Question[]; idx: number; correct: number; wrong: number } | null {
  if (saved.total !== all.length) return null;

  const allowed = new Set(filtered);
  const seen = new Set<Question>();
  const deck: Question[] = [];
  for (const i of saved.order) {
    const item = all[i];
    if (!item || !allowed.has(item) || seen.has(item)) continue;
    seen.add(item);
    deck.push(item);
  }
  deck.push(...shuffle(filtered.filter((item) => !seen.has(item))));
  if (deck.length === 0) return null;

  return {
    deck,
    idx: Math.min(saved.idx, deck.length),
    correct: Math.min(saved.correct, deck.length),
    wrong: Math.min(saved.wrong, deck.length),
  };
}

export default function QuizEngine({
  questions,
  slug,
}: {
  questions: Question[];
  slug?: string;
}) {
  const [deck, setDeck] = useState<Question[]>(questions);
  const [idx, setIdx] = useState(0);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [scoreWrong, setScoreWrong] = useState(0);
  const [complete, setComplete] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Saved-session hydration: local copy first, then the copy on the profile
  const [syncReady, setSyncReady] = useState(false);
  const pendingRestore = useRef<QuizSession | null>(null);
  const restoreUsed = useRef(false);
  const pulled = useRef(false);
  const localSavedAt = useRef(0);
  const builtDeck = useRef<Question[] | null>(null);
  const { data: session, isPending: sessionPending } = authClient.useSession();

  // Fill-in-blank
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [blankStates, setBlankStates] = useState<BlankState[]>([]);
  const [reveals, setReveals] = useState<boolean[]>([]);

  // Index of the question whose answer is currently on screen, so leaving
  // mid-feedback resumes on the next question instead of repeating it
  const [answeredAt, setAnsweredAt] = useState<number | null>(null);

  // Multiple choice
  const [choicesOrder, setChoicesOrder] = useState<string[]>([]);
  const [choiceResults, setChoiceResults] = useState<Record<string, ChoiceResult>>({});

  // Feedback + animation
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [cardClass, setCardClass] = useState('');

  // Fuzzy-match notice
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState('');

  // Filter sidebar
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
  const questionIndex = useMemo(() => {
    const m = new Map<Question, number>();
    questions.forEach((item, i) => m.set(item, i));
    return m;
  }, [questions]);

  /** Saved category names that still exist, or every category. */
  function sessionCats(saved: QuizSession | null): Set<string> {
    const names = saved?.cats?.filter((c) => allCats.includes(c)) ?? [];
    return new Set(names.length > 0 ? names : allCats);
  }

  const q = deck[idx];
  const answers = q?.answer.split(',') ?? [];
  const isChoice = !!q?.choices;
  const isMulti = answers.length > 1;

  // Initial mount — resume this device's saved session (if any) and populate
  // selectedCats, which triggers the deck effect below
  useEffect(() => {
    const saved = slug ? loadQuizSession(slug) : null;
    if (saved && saved.total === questions.length) {
      pendingRestore.current = saved;
      localSavedAt.current = saved.updatedAt;
    }
    setSelectedCats(sessionCats(pendingRestore.current));
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild deck whenever the category filter changes
  useEffect(() => {
    if (selectedCats.size === 0) {
      setDeck([]);
      return;
    }
    const filtered = questions.filter((q) => selectedCats.has(q.cat));
    clearTimeout(advanceTimer.current);

    // Put the student back where they left off, if there is a saved session
    if (pendingRestore.current && !restoreUsed.current) {
      restoreUsed.current = true;
      const saved = pendingRestore.current;
      pendingRestore.current = null;
      const restored = restoreDeck(saved, filtered, questions);
      if (restored) {
        builtDeck.current = restored.deck;
        setDeck(restored.deck);
        setScoreCorrect(restored.correct);
        setScoreWrong(restored.wrong);
        setAnswered(false);
        setAnsweredAt(null);
        setFeedbackType(null);
        setFeedbackText('');
        setCardClass('');
        setNoticeVisible(false);
        if (restored.idx >= restored.deck.length) {
          setIdx(restored.deck.length - 1);
          setComplete(true);
        } else {
          setIdx(restored.idx);
          setComplete(false);
        }
        return;
      }
    }

    const fresh = shuffle(filtered);
    builtDeck.current = fresh;
    setDeck(fresh);
    setIdx(0);
    setScoreCorrect(0);
    setScoreWrong(0);
    setComplete(false);
    setAnswered(false);
    setFeedbackType(null);
    setFeedbackText('');
    setCardClass('');
    setNoticeVisible(false);
  }, [selectedCats]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset per-question state when question changes
  useEffect(() => {
    if (!q) return;
    const ans = q.answer.split(',');
    setAnswered(false);
    setAnsweredAt(null);
    setFeedbackType(null);
    setFeedbackText('');
    setCardClass('');
    setInputValues(ans.map(() => ''));
    setBlankStates(ans.map((): BlankState => 'neutral'));
    setReveals(ans.map(() => false));
    if (q.choices) {
      setChoicesOrder(shuffle(q.choices));
      setChoiceResults({});
    }
  }, [idx, deck]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus first input on fill-in-blank questions
  useEffect(() => {
    if (!isChoice) {
      const t = setTimeout(() => {
        const el = document.getElementById('blank-0') as HTMLInputElement | null;
        el?.focus();
        el?.select();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [idx, deck, isChoice]);

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearTimeout(advanceTimer.current);
    },
    []
  );

  // Remind to sign in after finishing a round, and record best score + progress
  useEffect(() => {
    if (!complete) return;
    const total = scoreCorrect + scoreWrong;
    const signedIn = !!session?.user;
    if (total > 0 && slug) {
      const pct = Math.round((scoreCorrect / total) * 100);
      try {
        const prev = Number(localStorage.getItem('best-' + slug) ?? -1);
        if (pct > prev) localStorage.setItem('best-' + slug, String(pct));
      } catch {
        // ignore
      }
      if (signedIn) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, kind: 'quiz', bestScore: pct }),
        }).catch(() => {});
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

  // Pull the session saved on the student's profile, so a round started on one
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

    if (!slug || !session?.user) {
      setSyncReady(true);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    pullSession(slug, 'quiz', controller.signal)
      .then((raw) => {
        const remote = sanitizeQuizSession(raw);
        if (!remote) return;
        if (remote.total !== questions.length) return;
        if (remote.updatedAt <= localSavedAt.current) return;
        // Another device is further along — adopt it here too
        saveQuizSession(slug, remote);
        localSavedAt.current = remote.updatedAt;
        pendingRestore.current = remote;
        restoreUsed.current = false;
        setSelectedCats(sessionCats(remote));
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setSyncReady(true);
      });
  }, [mounted, sessionPending, session, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist the current position on the device and on the profile
  useEffect(() => {
    if (!mounted || !syncReady || !slug) return;
    if (complete || deck.length === 0 || selectedCats.size === 0) return;
    // Only save once the deck in state is the one just built above
    if (builtDeck.current !== deck) return;

    const order = deck.map((item) => questionIndex.get(item));
    if (order.some((i) => i === undefined)) return;

    const state: QuizSession = {
      order: order as number[],
      idx: answeredAt === idx ? idx + 1 : idx,
      correct: scoreCorrect,
      wrong: scoreWrong,
      cats: selectedCats.size >= allCats.length ? null : [...selectedCats],
      total: questions.length,
      updatedAt: Date.now(),
    };
    saveQuizSession(slug, state);
    localSavedAt.current = state.updatedAt;
    pushSession(slug, 'quiz', state);
  }, [
    mounted,
    syncReady,
    slug,
    complete,
    deck,
    idx,
    answeredAt,
    scoreCorrect,
    scoreWrong,
    selectedCats,
    allCats,
    questionIndex,
    questions.length,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // A finished round has no position left to resume
  useEffect(() => {
    if (!complete || !slug) return;
    clearQuizSession(slug);
    dropSession(slug, 'quiz');
  }, [complete, slug]);

  // Keep a ref to the latest state + functions so the Enter handler never goes stale
  const stateRef = useRef({ answered: false, isChoice: false, isMulti: false });
  stateRef.current = { answered, isChoice, isMulti };

  const fnRef = useRef({
    checkAnswer: () => {},
    nextQuestion: () => {},
  });

  function showNotice(msg: string) {
    clearTimeout(toastTimer.current);
    setNoticeMsg(msg);
    setNoticeVisible(true);
    toastTimer.current = setTimeout(() => setNoticeVisible(false), 4000);
  }

  function nextQuestion() {
    clearTimeout(advanceTimer.current);
    if (idx + 1 >= deck.length) {
      setComplete(true);
    } else {
      setIdx((i) => i + 1);
    }
  }

  function handleChoiceClick(choice: string) {
    if (answered) return;
    setAnsweredAt(idx);
    const isCorrect = normalize(choice) === normalize(q.answer);

    const newResults: Record<string, ChoiceResult> = {};
    choicesOrder.forEach((c) => {
      if (normalize(c) === normalize(q.answer)) newResults[c] = 'correct';
      else if (c === choice && !isCorrect) newResults[c] = 'wrong';
    });
    setChoiceResults(newResults);
    setAnswered(true);

    if (isCorrect) {
      setScoreCorrect((s) => s + 1);
      setCardClass('correct-state pop');
      setFeedbackType('correct');
      setFeedbackText('Correct!');
      advanceTimer.current = setTimeout(nextQuestion, 900);
    } else {
      setScoreWrong((s) => s + 1);
      setCardClass('wrong-state shake');
      setFeedbackType('wrong');
      setFeedbackText('Not quite — the correct answer is highlighted.');
    }
  }

  function checkAnswer() {
    if (answered) { nextQuestion(); return; }
    if (isChoice) return;
    setAnsweredAt(idx);

    const userVals = answers.map((_, i) => inputValues[i] ?? '');
    let allCorrect = true;
    const fuzzyMsgs: string[] = [];
    let swapped = false;

    if (answers.length > 1) {
      for (const perm of getPermutations(userVals)) {
        if (perm.join('|') === userVals.join('|')) continue;
        if (
          perm.every((val, i) => {
            const opts = answers[i].split('/');
            return opts.map((o) => normalize(o)).includes(normalize(val)) || isFuzzyMatch(val, opts);
          })
        ) {
          swapped = true;
          break;
        }
      }
    }

    const newBlank: BlankState[] = [];
    const newReveals: boolean[] = [];

    answers.forEach((ans, i) => {
      const opts = ans.split('/');
      const exact = opts.map((o) => normalize(o)).includes(normalize(userVals[i]));
      const fuzzy = !exact && isFuzzyMatch(userVals[i], opts);
      const right = exact || fuzzy || swapped;

      if (fuzzy && !swapped) {
        fuzzyMsgs.push(
          `You wrote <strong>"${userVals[i]}"</strong> — the answer is <strong>"${opts[0]}"</strong>`
        );
      }
      newBlank.push(right ? 'correct' : 'wrong');
      newReveals.push(!right);
      if (!right) allCorrect = false;
    });

    if (swapped && answers.length > 1) {
      fuzzyMsgs.length = 0;
      fuzzyMsgs.push(
        `Answers in wrong order — correct order is ${answers
          .map((a) => `<strong>"${a.split('/')[0]}"</strong>`)
          .join(' and ')}`
      );
    }

    setBlankStates(newBlank);
    setReveals(newReveals);
    setAnswered(true);

    if (allCorrect) {
      setScoreCorrect((s) => s + 1);
      setCardClass('correct-state pop');
      setFeedbackType('correct');
      setFeedbackText(fuzzyMsgs.length ? 'Close enough — marked correct!' : 'Correct!');
      if (fuzzyMsgs.length) showNotice(fuzzyMsgs.join('<br>'));
      advanceTimer.current = setTimeout(nextQuestion, fuzzyMsgs.length ? 1400 : 900);
    } else {
      setScoreWrong((s) => s + 1);
      setCardClass('wrong-state shake');
      setFeedbackType('wrong');
      setFeedbackText('Not quite — check the correct answer above.');
    }
  }

  // Update fn refs after function definitions so the Enter handler always has the latest
  fnRef.current = { checkAnswer, nextQuestion };

  // Enter key — registered once, reads from refs to avoid stale closures
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (stateRef.current.answered) {
        fnRef.current.nextQuestion();
        return;
      }
      if (stateRef.current.isChoice) return;
      // Multi-blank: Enter moves to the next blank first; last blank submits
      if (stateRef.current.isMulti) {
        const inputs = Array.from(
          document.querySelectorAll<HTMLInputElement>('[id^="blank-"]')
        ).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        const active = document.activeElement;
        const activeIdx = active ? inputs.findIndex((el) => el === active) : -1;
        if (activeIdx >= 0 && activeIdx < inputs.length - 1) {
          e.preventDefault();
          const next = inputs[activeIdx + 1];
          next.focus();
          next.select();
          return;
        }
      }
      fnRef.current.checkAnswer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCat(cat: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function restart() {
    clearTimeout(advanceTimer.current);
    clearTimeout(toastTimer.current);
    const filtered = questions.filter((q) => selectedCats.has(q.cat));
    const fresh = shuffle(filtered.length > 0 ? filtered : questions);
    builtDeck.current = fresh;
    setDeck(fresh);
    setIdx(0);
    setScoreCorrect(0);
    setScoreWrong(0);
    setComplete(false);
    setNoticeVisible(false);
  }

  const progress = deck.length > 0 ? (idx / deck.length) * 100 : 0;
  const total = scoreCorrect + scoreWrong;
  const pct = total > 0 ? Math.round((scoreCorrect / total) * 100) : 0;

  const formatQ = (text: string) =>
    text.replace(/\*{3,}|_{5,}/g, '<span class="blank-hl">_____</span>');

  // ── Sidebar ────────────────────────────────────────────────────
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

  // ── Filter bar (shown above scorebar) ──────────────────────────
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

  if (!mounted || !syncReady) return null;

  // No categories selected
  if (deck.length === 0) {
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
          <h2 className="text-3xl font-bold tracking-tight">Round complete</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            You&apos;ve gone through all {deck.length} questions.
          </p>
          <div className="mt-9 mb-9 flex justify-center gap-10">
            <div>
              <span className="block text-4xl font-medium tabular-nums text-correct">
                {scoreCorrect}
              </span>
              <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Correct</span>
            </div>
            <div>
              <span className="block text-4xl font-medium tabular-nums text-wrong">
                {scoreWrong}
              </span>
              <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Wrong</span>
            </div>
            <div>
              <span className="block text-4xl font-medium tabular-nums text-primary">{pct}%</span>
              <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Score</span>
            </div>
          </div>
          <div className="mt-9 flex justify-center gap-3">
            <Button onClick={restart}>Study Again</Button>
            <Button variant="outline" onClick={() => setSidebarOpen(true)}>
              Change Categories
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {sidebar}

      {filterBar}

      <div className="mb-7 flex items-center gap-5 border border-border bg-card px-5 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="size-2 rounded-full bg-correct" />
          <span className="font-medium tabular-nums">{scoreCorrect}</span>
          <span className="text-muted-foreground">correct</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="size-2 rounded-full bg-wrong" />
          <span className="font-medium tabular-nums">{scoreWrong}</span>
          <span className="text-muted-foreground">wrong</span>
        </div>
        <div className="h-[3px] flex-1 overflow-hidden bg-border">
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs tabular-nums text-muted-foreground">
          {idx + 1} / {deck.length}
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
        <div
          className="mb-8 text-[21px] leading-normal font-semibold tracking-tight break-words sm:text-[22px]"
          dangerouslySetInnerHTML={{ __html: formatQ(q.question) }}
        />
        <div className="mb-2.5 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          {isChoice
            ? 'Choose one:'
            : isMulti
            ? `Fill in all ${answers.length} blanks`
            : 'Your answer'}
        </div>

        {isChoice ? (
          <div>
            {choicesOrder.map((choice, i) => {
              const r = choiceResults[choice];
              const cls =
                r === 'correct'
                  ? 'border-correct bg-correct/10 text-correct'
                  : r === 'wrong'
                  ? 'border-wrong bg-wrong/10 text-wrong'
                  : 'border-border bg-background hover:border-muted-foreground/60 hover:bg-accent';
              return (
                <button
                  key={i}
                  className={`mb-2 w-full border px-4 py-3.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={answered}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            {answers.map((ans, i) => (
              <div key={i} className="mb-3">
                <input
                  id={`blank-${i}`}
                  type="text"
                  className={`blank-input${
                    blankStates[i] !== 'neutral' ? ` ${blankStates[i]}` : ''
                  }`}
                  placeholder={isMulti ? `Blank ${i + 1}` : 'Type your answer...'}
                  value={inputValues[i] ?? ''}
                  onChange={(e) =>
                    setInputValues((vals) => {
                      const v = [...vals];
                      v[i] = e.target.value;
                      return v;
                    })
                  }
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
        )}

        <div
          className={`mt-5 flex items-center gap-2.5 border px-4 py-3 text-sm font-semibold ${
            feedbackType === 'correct'
              ? 'border-correct/30 bg-correct/10 text-correct'
              : feedbackType === 'wrong'
              ? 'border-wrong/30 bg-wrong/10 text-wrong'
              : 'hidden'
          }`}
        >
          <span className="flex-shrink-0">
            {feedbackType === 'correct' ? <Check className="size-4" /> : feedbackType === 'wrong' ? <X className="size-4" /> : null}
          </span>
          <span>{feedbackText}</span>
        </div>

        <div className="mt-7 flex gap-3">
          <Button
            className="flex-1"
            onClick={answered ? nextQuestion : isChoice ? undefined : checkAnswer}
            disabled={!answered && isChoice}
          >
            {answered
              ? idx < deck.length - 1
                ? 'Next Question →'
                : 'See Results →'
              : 'Check Answer'}
          </Button>
          {!answered && (
            <Button variant="outline" onClick={nextQuestion}>
              Skip →
            </Button>
          )}
        </div>
      </div>

      {noticeVisible && (
        <div className="fixed bottom-8 left-1/2 z-50 flex w-[calc(100%-40px)] max-w-sm -translate-x-1/2 gap-3 border border-primary/30 bg-card px-5 py-4 shadow-lg">
          <div className="flex-1">
            <div className="mb-1 text-[13px] font-bold tracking-[0.06em] text-primary uppercase">
              Close enough — marked correct
            </div>
            <div
              className="text-[13px] leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: noticeMsg }}
            />
          </div>
          <button
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearTimeout(toastTimer.current);
              setNoticeVisible(false);
            }}
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
