import type { Question } from '@/data/types';
import { shuffle } from './quiz';

export function generateChoices(
  targetQuestion: Question,
  allQuestions: Question[],
  count: number = 4
): string[] {
  if (targetQuestion.choices) {
    return shuffle(targetQuestion.choices);
  }

  const correctAnswer = targetQuestion.answer.includes(',')
    ? targetQuestion.answer.split(',')[0]
    : targetQuestion.answer;

  const getAnswer = (q: Question) =>
    q.answer.includes(',') ? q.answer.split(',')[0] : q.answer;

  const sameCat = allQuestions
    .filter((q) => q.cat === targetQuestion.cat && q !== targetQuestion)
    .map(getAnswer)
    .filter((a) => a !== correctAnswer);

  let pool = [...new Set(sameCat)];

  if (pool.length < count - 1) {
    const allAnswers = allQuestions
      .filter((q) => q !== targetQuestion)
      .map(getAnswer)
      .filter((a) => a !== correctAnswer);
    pool = [...new Set([...pool, ...allAnswers])];
  }

  const distractors = shuffle(pool).slice(0, count - 1);
  return shuffle([correctAnswer, ...distractors]);
}

export function getCorrectAnswer(question: Question): string {
  if (question.choices) return question.answer;
  return question.answer.includes(',')
    ? question.answer.split(',')[0]
    : question.answer;
}
