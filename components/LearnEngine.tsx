'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Question } from '@/data/types';
import { shuffle, normalize, isFuzzyMatch } from '@/lib/quiz';
import { generateChoices, getCorrectAnswer } from '@/lib/learn-algorithm';
import { loadProgress, saveProgress, resetProgress } from '@/lib/learn-storage';
import type { LearnSessionState } from '@/lib/learn-types';

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
  const [inputValue, setInputValue] = useState('');
  const [inputState, setInputState] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [showReveal, setShowReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter sidebar
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // True on the first selectedCats effect run so we can restore saved progress
  const isInitialMount = useRef(true);

  function filteredIndices(cats: Set<string>): number[] {
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => cats.has(q.cat))
      .map(({ i }) => i);
  }

  function makeFreshSession(cats: Set<string>): LearnSessionState {
    return {
      slug,
      remaining: shuffle(filteredIndices(cats)),
      wrongPile: [],
      currentIdx: 0,
      round: 1,
      totalCorrect: 0,
      totalWrong: 0,
    };
  }

  // Initial mount — populate selectedCats (triggers session effect below)
  useEffect(() => {
    setSelectedCats(new Set(questions.map((q) => q.cat)));
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
      const existing = loadProgress(slug);
      const isValid =
        existing &&
        Array.isArray(existing.remaining) &&
        Array.isArray(existing.wrongPile) &&
        existing.remaining.length + existing.wrongPile.length <= questions.length;
      state = isValid ? existing! : makeFreshSession(selectedCats);
    } else {
      state = makeFreshSession(selectedCats);
    }

    setSession(state);
    saveProgress(state);
    loadQuestion(state);
    setComplete(false);
  }, [selectedCats]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingAdvance) {
      setPendingAdvance(false);
      advance();
    }
  }, [pendingAdvance]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setInputValue('');
    setInputState('neutral');
    setShowReveal(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function markAnswer(isCorrect: boolean) {
    if (!session) return;
    const qIdx = session.remaining[session.currentIdx];
    const updated = { ...session };
    if (isCorrect) {
      updated.totalCorrect++;
    } else {
      updated.totalWrong++;
      updated.wrongPile = [...updated.wrongPile, qIdx];
    }
    setSession(updated);
    saveProgress(updated);
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
    if (answered || !session || !inputValue.trim()) return;
    setAnswered(true);

    const qIdx = session.remaining[session.currentIdx];
    const q = questions[qIdx];
    const correct = getCorrectAnswer(q);
    const validOptions = correct.includes('/') ? correct.split('/') : [correct];

    const normalizedInput = normalize(inputValue);
    const isExact = validOptions.some((opt) => normalize(opt) === normalizedInput);
    const isFuzzy = !isExact && isFuzzyMatch(inputValue, validOptions);
    const isCorrect = isExact || isFuzzy;

    if (isCorrect) {
      setInputState('correct');
      setCardClass('correct-state pop');
    } else {
      setInputState('wrong');
      setCardClass('wrong-state shake');
      setShowReveal(true);
    }
    markAnswer(isCorrect);

    if (isCorrect) {
      setTimeout(() => setPendingAdvance(true), 900);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (answered) {
        advance();
      } else {
        handleSubmitInput();
      }
    }
  }

  function advance() {
    if (!session) return;

    const nextIdx = session.currentIdx + 1;

    if (nextIdx >= session.remaining.length) {
      if (session.wrongPile.length === 0) {
        setComplete(true);
        resetProgress(slug);
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
      saveProgress(newSession);
      loadQuestion(newSession);
      return;
    }

    const updated = { ...session, currentIdx: nextIdx };
    setSession(updated);
    saveProgress(updated);
    loadQuestion(updated);
  }

  function handleReset() {
    resetProgress(slug);
    const fresh = makeFreshSession(selectedCats);
    setSession(fresh);
    saveProgress(fresh);
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

  if (!mounted) return null;

  // ── Sidebar ──────────────────────────────────────────────────────
  const sidebar = (
    <>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Categories</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sidebar-actions">
          <button
            className="sidebar-action-btn"
            onClick={() => setSelectedCats(new Set(allCats))}
          >
            All
          </button>
          <button
            className="sidebar-action-btn"
            onClick={() => setSelectedCats(new Set())}
          >
            None
          </button>
        </div>
        <div className="sidebar-cats">
          {allCats.map((cat) => (
            <div
              key={cat}
              className={`sidebar-cat-item${selectedCats.has(cat) ? ' checked' : ''}`}
              onClick={() => toggleCat(cat)}
            >
              <div className="sidebar-cat-check">
                {selectedCats.has(cat) && <span className="sidebar-cat-check-icon">✓</span>}
              </div>
              <span className="sidebar-cat-name">{cat}</span>
              <span className="sidebar-cat-count">{catCounts[cat]}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <span className="sidebar-q-count">
            <strong>{filteredCount}</strong> / {questions.length} questions active
          </span>
        </div>
      </div>
    </>
  );

  // ── Filter bar ───────────────────────────────────────────────────
  const filterBar = (
    <div className="filter-bar">
      <button className="filter-toggle-btn" onClick={() => setSidebarOpen(true)}>
        <span className="filter-toggle-icon">⊞</span>
        <span>Categories</span>
        {selectedCats.size < allCats.length && allCats.length > 0 && (
          <span className="filter-chip">{selectedCats.size} / {allCats.length}</span>
        )}
      </button>
    </div>
  );

  // No categories selected
  if (!session || selectedCats.size === 0) {
    return (
      <>
        {sidebar}
        {filterBar}
        <div className="filter-empty">
          <p>No categories selected.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setSelectedCats(new Set(allCats))}
          >
            Select All
          </button>
        </div>
      </>
    );
  }

  if (complete) {
    return (
      <>
        {sidebar}
        <div className="complete show">
          <div className="complete-icon">&#10003;</div>
          <h2>All questions correct!</h2>
          <p>Finished in {session.round} round{session.round > 1 ? 's' : ''} with {session.totalCorrect} correct and {session.totalWrong} wrong answers total.</p>
          <div className="final-stats">
            <div className="stat-big green">
              <span className="num">{filteredCount}</span>
              <span className="lbl">Questions</span>
            </div>
            <div className="stat-big">
              <span className="num" style={{ color: 'var(--accent)' }}>{session.round}</span>
              <span className="lbl">Rounds</span>
            </div>
          </div>
          <button className="btn btn-restart" onClick={handleReset}>
            Study Again
          </button>
          <button
            className="btn btn-skip"
            style={{ marginTop: 12, display: 'block', width: '100%' }}
            onClick={() => setSidebarOpen(true)}
          >
            Change Categories
          </button>
        </div>
      </>
    );
  }

  const qIdx = session.remaining[session.currentIdx];
  if (qIdx === undefined) return null;
  const q = questions[qIdx];
  const isChoice = !!q.choices;
  const progressPct = (session.currentIdx / session.remaining.length) * 100;

  return (
    <>
      {sidebar}

      {filterBar}

      <div className="learn-topbar">
        <div className="learn-progress-bar">
          <div className="learn-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="learn-topbar-info">
          <span className="learn-mastery-count">
            Round {session.round} {session.wrongPile.length > 0 && `· ${session.wrongPile.length} wrong`}
          </span>
          <span className="q-counter">{session.currentIdx + 1}/{session.remaining.length}</span>
        </div>
      </div>

      <div
        className={`card${cardClass ? ` ${cardClass}` : ''}`}
        onAnimationEnd={() =>
          setCardClass((prev) => prev.replace(' pop', '').replace(' shake', ''))
        }
      >
        <div className="category-badge">{q.cat}</div>
        <div className="question-text">
          {q.question.replace(/_{5,}/g, '_____')}
        </div>

        {isChoice ? (
          <>
            <div className="blank-label">Choose one:</div>
            <div>
              {choices.map((choice, i) => {
                const r = choiceResult[choice];
                const cls = `mc-choice${r === 'correct' ? ' mc-correct' : ''}${r === 'wrong' ? ' mc-wrong' : ''}`;
                return (
                  <button
                    key={`${choice}-${i}`}
                    className={cls}
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
            <div className="blank-label">Your answer</div>
            <div className="input-wrap">
              <input
                ref={inputRef}
                type="text"
                className={`blank-input ${inputState}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={answered}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {showReveal && (
              <div className="correct-answer-reveal show">
                Correct answer: {getCorrectAnswer(q)}
              </div>
            )}
            {!answered && (
              <div className="btn-row">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitInput}
                  disabled={!inputValue.trim()}
                >
                  Check
                </button>
              </div>
            )}
          </>
        )}

        {answered && !isChoice && inputState === 'wrong' && (
          <div className="btn-row">
            <button className="btn btn-primary" onClick={advance}>
              Continue
            </button>
          </div>
        )}

        {answered && isChoice && choiceResult[Object.keys(choiceResult).find(k => choiceResult[k] === 'wrong') || ''] && (
          <div className="btn-row">
            <button className="btn btn-primary" onClick={advance}>
              Continue
            </button>
          </div>
        )}
      </div>
    </>
  );
}
