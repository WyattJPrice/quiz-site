'use client';

import { useState, useEffect } from 'react';
import type { Question } from '@/data/types';
import { shuffle } from '@/lib/quiz';
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

  function createFreshSession(): LearnSessionState {
    return {
      slug,
      remaining: shuffle(Array.from({ length: questions.length }, (_, i) => i)),
      wrongPile: [],
      currentIdx: 0,
      round: 1,
      totalCorrect: 0,
      totalWrong: 0,
    };
  }

  useEffect(() => {
    const existing = loadProgress(slug);
    const isValid =
      existing &&
      Array.isArray(existing.remaining) &&
      Array.isArray(existing.wrongPile) &&
      existing.remaining.length + existing.wrongPile.length <= questions.length;
    const state = isValid ? existing : createFreshSession();
    setSession(state);
    saveProgress(state);
    loadQuestion(state);
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setChoices(generateChoices(q, questions));
    setChoiceResult({});
    setAnswered(false);
    setCardClass('');
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

    const updated = { ...session };
    if (isCorrect) {
      updated.totalCorrect++;
    } else {
      updated.totalWrong++;
      updated.wrongPile = [...updated.wrongPile, qIdx];
    }
    setSession(updated);
    saveProgress(updated);

    if (isCorrect) {
      setTimeout(() => setPendingAdvance(true), 900);
    }
  }

  function advance() {
    if (!session) return;

    const nextIdx = session.currentIdx + 1;

    if (nextIdx >= session.remaining.length) {
      // Finished this pass — move to wrong pile
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
    const fresh = createFreshSession();
    setSession(fresh);
    saveProgress(fresh);
    loadQuestion(fresh);
    setComplete(false);
  }

  if (!mounted || !session) return null;

  if (complete) {
    return (
      <div className="complete show">
        <div className="complete-icon">&#10003;</div>
        <h2>All questions correct!</h2>
        <p>Finished in {session.round} round{session.round > 1 ? 's' : ''} with {session.totalCorrect} correct and {session.totalWrong} wrong answers total.</p>
        <div className="final-stats">
          <div className="stat-big green">
            <span className="num">{questions.length}</span>
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
      </div>
    );
  }

  const qIdx = session.remaining[session.currentIdx];
  if (qIdx === undefined) return null;
  const q = questions[qIdx];
  const progressPct = ((session.currentIdx) / session.remaining.length) * 100;

  return (
    <>
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

        {answered && choiceResult[Object.keys(choiceResult).find(k => choiceResult[k] === 'wrong') || ''] && (
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
