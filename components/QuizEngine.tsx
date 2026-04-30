'use client';

import { useState, useEffect, useRef } from 'react';
import type { Question } from '@/data/types';
import { shuffle, normalize, isFuzzyMatch, getPermutations } from '@/lib/quiz';

type BlankState = 'neutral' | 'correct' | 'wrong';
type ChoiceResult = 'correct' | 'wrong' | undefined;

export default function QuizEngine({ questions }: { questions: Question[] }) {
  const [deck, setDeck] = useState<Question[]>(() => shuffle(questions));
  const [idx, setIdx] = useState(0);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [scoreWrong, setScoreWrong] = useState(0);
  const [complete, setComplete] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Fill-in-blank
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [blankStates, setBlankStates] = useState<BlankState[]>([]);
  const [reveals, setReveals] = useState<boolean[]>([]);

  // Multiple choice
  const [choicesOrder, setChoicesOrder] = useState<string[]>([]);
  const [choiceResults, setChoiceResults] = useState<Record<string, ChoiceResult>>({});

  // Feedback + animation
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [cardClass, setCardClass] = useState('');

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const q = deck[idx];
  const answers = q?.answer.split(',') ?? [];
  const isChoice = !!q?.choices;
  const isMulti = answers.length > 1;

  // Reset per-question state when question changes
  useEffect(() => {
    if (!q) return;
    const ans = q.answer.split(',');
    setAnswered(false);
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

  // Keep a ref to the latest state + functions so the Enter handler never goes stale
  const stateRef = useRef({ answered: false, isChoice: false });
  stateRef.current = { answered, isChoice };

  const fnRef = useRef({
    checkAnswer: () => {},
    nextQuestion: () => {},
  });

  function showToast(msg: string) {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000);
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
      if (fuzzyMsgs.length) showToast(fuzzyMsgs.join('<br>'));
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
      if (stateRef.current.answered) fnRef.current.nextQuestion();
      else if (!stateRef.current.isChoice) fnRef.current.checkAnswer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function restart() {
    clearTimeout(advanceTimer.current);
    clearTimeout(toastTimer.current);
    setDeck(shuffle(questions));
    setIdx(0);
    setScoreCorrect(0);
    setScoreWrong(0);
    setComplete(false);
    setToastVisible(false);
  }

  const progress = deck.length > 0 ? (idx / deck.length) * 100 : 0;
  const total = scoreCorrect + scoreWrong;
  const pct = total > 0 ? Math.round((scoreCorrect / total) * 100) : 0;

  const formatQ = (text: string) =>
    text.replace(/\*{3,}|_{5,}/g, '<span class="blank-hl">_____</span>');

  if (!q && !complete) return null;

  if (complete) {
    return (
      <div className="complete show">
        <div className="complete-icon">🎓</div>
        <h2>Study session complete!</h2>
        <p>You&apos;ve gone through all {deck.length} questions.</p>
        <div className="final-stats">
          <div className="stat-big green">
            <span className="num">{scoreCorrect}</span>
            <span className="lbl">Correct</span>
          </div>
          <div className="stat-big red">
            <span className="num">{scoreWrong}</span>
            <span className="lbl">Wrong</span>
          </div>
          <div className="stat-big">
            <span className="num" style={{ color: 'var(--accent)' }}>{pct}%</span>
            <span className="lbl">Score</span>
          </div>
        </div>
        <button className="btn btn-restart" onClick={restart}>
          Study Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="scorebar">
        <div className="score-item">
          <span className="score-dot correct" />
          <span className="score-val">{scoreCorrect}</span>
          <span className="score-label">correct</span>
        </div>
        <div className="score-item">
          <span className="score-dot wrong" />
          <span className="score-val">{scoreWrong}</span>
          <span className="score-label">wrong</span>
        </div>
        <div className="progress-wrap">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="q-counter">
          {idx + 1} / {deck.length}
        </div>
      </div>

      <div
        className={`card${cardClass ? ` ${cardClass}` : ''}`}
        onAnimationEnd={() =>
          setCardClass((prev) => prev.replace(' pop', '').replace(' shake', ''))
        }
      >
        <div className="category-badge">{q.cat}</div>
        <div
          className="question-text"
          dangerouslySetInnerHTML={{ __html: formatQ(q.question) }}
        />
        <div className="blank-label">
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
              const cls = `mc-choice${
                r === 'correct' ? ' mc-correct' : r === 'wrong' ? ' mc-wrong' : ''
              }`;
              return (
                <button
                  key={i}
                  className={cls}
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
              <div key={i} className="input-wrap">
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
                <div className={`correct-answer-reveal${reveals[i] ? ' show' : ''}`}>
                  ✓ {ans.split('/')[0]}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`feedback${feedbackType ? ` ${feedbackType} show` : ''}`}>
          <span className="feedback-icon">
            {feedbackType === 'correct' ? '✓' : feedbackType === 'wrong' ? '✗' : ''}
          </span>
          <span className="feedback-text">{feedbackText}</span>
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={answered ? nextQuestion : isChoice ? undefined : checkAnswer}
            disabled={!answered && isChoice}
          >
            {answered
              ? idx < deck.length - 1
                ? 'Next Question →'
                : 'See Results →'
              : 'Check Answer'}
          </button>
          {!answered && (
            <button className="btn btn-skip" onClick={nextQuestion}>
              Skip →
            </button>
          )}
        </div>
      </div>

      {toastVisible && (
        <div className="toast show">
          <span className="toast-icon">💡</span>
          <div className="toast-body">
            <div className="toast-title">Close enough — marked correct</div>
            <div
              className="toast-msg"
              dangerouslySetInnerHTML={{ __html: toastMsg }}
            />
          </div>
          <button
            className="toast-close"
            onClick={() => {
              clearTimeout(toastTimer.current);
              setToastVisible(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
