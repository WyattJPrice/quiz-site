'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/data/types';
import { shuffle } from '@/lib/quiz';
import {
  generateRound,
  generateChoices,
  updateAfterAnswer,
  isSessionComplete,
  getMasteredCount,
} from '@/lib/learn-algorithm';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  createFreshState,
} from '@/lib/learn-storage';
import type { LearnSessionState } from '@/lib/learn-types';

interface Props {
  questions: Question[];
  slug: string;
}

export default function LearnEngine({ questions, slug }: Props) {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<LearnSessionState | null>(null);
  const [roundQueue, setRoundQueue] = useState<number[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [choiceResult, setChoiceResult] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [answered, setAnswered] = useState(false);
  const [cardClass, setCardClass] = useState('');
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [roundMastered, setRoundMastered] = useState(0);
  const [complete, setComplete] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);

  useEffect(() => {
    const existing = loadProgress(slug);
    const state = existing && existing.questionsProgress.length === questions.length
      ? existing
      : createFreshState(slug, questions.length);
    setSession(state);
    saveProgress(state);
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((state: LearnSessionState) => {
    const queue = generateRound(state.questionsProgress, state.round);
    if (queue.length === 0) {
      setComplete(true);
      return;
    }
    setRoundQueue(queue);
    setRoundIdx(0);
    setShowRoundTransition(false);
    setRoundMastered(0);

    const q = questions[queue[0]];
    const prog = state.questionsProgress[queue[0]];
    setChoices(generateChoices(q, questions, prog.lastDistractors));
    setChoiceResult({});
    setAnswered(false);
    setCardClass('');
  }, [questions]);

  useEffect(() => {
    if (session && mounted) {
      startRound(session);
    }
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChoice(choice: string) {
    if (answered || !session) return;
    setAnswered(true);

    const qIdx = roundQueue[roundIdx];
    const q = questions[qIdx];
    const correctAnswer = q.choices
      ? q.answer
      : (q.answer.includes(',') ? q.answer.split(',')[0] : q.answer);
    const isCorrect =
      choice.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    const results: Record<string, 'correct' | 'wrong'> = {};
    if (isCorrect) {
      results[choice] = 'correct';
      setCardClass('correct-state pop');
    } else {
      results[choice] = 'wrong';
      results[correctAnswer] = 'correct';
      setCardClass('wrong-state shake');
    }
    setChoiceResult(results);

    const updatedProgress = [...session.questionsProgress];
    const updated = updateAfterAnswer(updatedProgress[qIdx], isCorrect, session.round);
    updated.lastDistractors = choices.filter(
      (c) => c.toLowerCase().trim() !== correctAnswer.toLowerCase().trim()
    );
    updatedProgress[qIdx] = updated;

    const newSession = { ...session, questionsProgress: updatedProgress };
    setSession(newSession);
    saveProgress(newSession);

    if (updated.mastered) {
      setRoundMastered((prev) => prev + 1);
    }

    if (isCorrect) {
      setTimeout(() => setPendingAdvance(true), 900);
    }
  }

  useEffect(() => {
    if (pendingAdvance) {
      setPendingAdvance(false);
      advance();
    }
  }, [pendingAdvance]); // eslint-disable-line react-hooks/exhaustive-deps

  function advance() {
    if (!session) return;
    const nextIdx = roundIdx + 1;

    if (nextIdx >= roundQueue.length) {
      if (isSessionComplete(session.questionsProgress)) {
        setComplete(true);
        return;
      }
      const newSession = { ...session, round: session.round + 1 };
      setSession(newSession);
      saveProgress(newSession);
      setShowRoundTransition(true);
      return;
    }

    setRoundIdx(nextIdx);
    const qIdx = roundQueue[nextIdx];
    const q = questions[qIdx];
    const prog = session.questionsProgress[qIdx];
    setChoices(generateChoices(q, questions, prog.lastDistractors));
    setChoiceResult({});
    setAnswered(false);
    setCardClass('');
  }

  function continueAfterTransition() {
    if (!session) return;
    startRound(session);
  }

  function handleReset() {
    if (!confirm('Reset all progress for this quiz?')) return;
    resetProgress(slug);
    const fresh = createFreshState(slug, questions.length);
    setSession(fresh);
    saveProgress(fresh);
    setComplete(false);
    startRound(fresh);
  }

  if (!mounted || !session) return null;

  const mastered = getMasteredCount(session.questionsProgress);
  const total = questions.length;
  const progressPct = (mastered / total) * 100;

  if (complete) {
    const totalAttempts = session.questionsProgress.reduce((s, p) => s + p.totalAttempts, 0);
    const hardest = [...session.questionsProgress]
      .sort((a, b) => b.totalMisses - a.totalMisses)
      .slice(0, 3)
      .filter((p) => p.totalMisses > 0);

    return (
      <div className="complete show">
        <div className="complete-icon">🏆</div>
        <h2>All questions mastered!</h2>
        <p>You completed {session.round + 1} rounds with {totalAttempts} total attempts.</p>
        <div className="final-stats">
          <div className="stat-big green">
            <span className="num">{total}</span>
            <span className="lbl">Mastered</span>
          </div>
          <div className="stat-big">
            <span className="num" style={{ color: 'var(--accent)' }}>{session.round + 1}</span>
            <span className="lbl">Rounds</span>
          </div>
        </div>
        {hardest.length > 0 && (
          <div className="learn-hardest">
            <span className="learn-hardest-title">Hardest questions</span>
            {hardest.map((p) => (
              <div key={p.questionIndex} className="learn-hardest-item">
                <span className="learn-hardest-q">
                  {questions[p.questionIndex].question.replace(/_{5,}/g, '___').slice(0, 60)}...
                </span>
                <span className="learn-hardest-misses">{p.totalMisses} miss{p.totalMisses > 1 ? 'es' : ''}</span>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-restart" onClick={handleReset}>
          Study Again
        </button>
      </div>
    );
  }

  if (showRoundTransition) {
    const remaining = total - mastered;
    return (
      <div className="learn-transition show">
        <div className="learn-transition-icon">✓</div>
        <h2>Round {session.round} complete!</h2>
        {roundMastered > 0 && (
          <p className="learn-transition-mastered">
            {roundMastered} question{roundMastered > 1 ? 's' : ''} mastered this round
          </p>
        )}
        <p>{remaining} question{remaining !== 1 ? 's' : ''} remaining</p>
        <div className="learn-progress-bar">
          <div className="learn-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="learn-progress-label">{mastered}/{total} mastered</span>
        <button className="btn btn-primary" onClick={continueAfterTransition}>
          Continue
        </button>
      </div>
    );
  }

  const qIdx = roundQueue[roundIdx];
  if (qIdx === undefined) return null;
  const q = questions[qIdx];
  const prog = session.questionsProgress[qIdx];

  return (
    <>
      <div className="learn-topbar">
        <div className="learn-progress-bar">
          <div className="learn-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="learn-topbar-info">
          <span className="learn-mastery-count">{mastered}/{total} mastered</span>
          <span className="q-counter">Round {session.round + 1} · {roundIdx + 1}/{roundQueue.length}</span>
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

        {prog.totalMisses > 0 && !answered && (
          <div className="learn-miss-badge">
            Missed {prog.totalMisses} time{prog.totalMisses > 1 ? 's' : ''} before
          </div>
        )}

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

        {answered && (
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
