import type { Question } from '@/data/types';
import type { QuestionProgress } from './learn-types';
import { MASTERY_THRESHOLD, RETRY_DELAY_ROUNDS, ROUND_SIZE_MAX } from './learn-types';
import { shuffle } from './quiz';

export function generateRound(
  progress: QuestionProgress[],
  currentRound: number
): number[] {
  const eligible = progress.filter((p) => {
    if (p.mastered) return false;
    if (
      p.lastMissRound !== null &&
      currentRound - p.lastMissRound < RETRY_DELAY_ROUNDS
    ) {
      return false;
    }
    return true;
  });

  // Priority sort: most missed first, then never attempted, then partially learned
  eligible.sort((a, b) => {
    if (a.totalMisses !== b.totalMisses) return b.totalMisses - a.totalMisses;
    if (a.totalAttempts === 0 && b.totalAttempts > 0) return -1;
    if (b.totalAttempts === 0 && a.totalAttempts > 0) return 1;
    return a.correctStreak - b.correctStreak;
  });

  const selected = eligible.slice(0, ROUND_SIZE_MAX).map((p) => p.questionIndex);
  return shuffle(selected);
}

export function generateChoices(
  targetQuestion: Question,
  allQuestions: Question[],
  previousDistractors: string[] | null,
  count: number = 4
): string[] {
  // If the question already has choices defined, shuffle and vary them
  if (targetQuestion.choices) {
    const correct = targetQuestion.answer;
    const wrongs = targetQuestion.choices.filter(
      (c) => c.toLowerCase() !== correct.toLowerCase()
    );

    // Variation: swap out a distractor if we have alternatives from same category
    if (previousDistractors && previousDistractors.length > 0) {
      const sameCatPool = allQuestions
        .filter((q) => q.cat === targetQuestion.cat && q.choices && q !== targetQuestion)
        .flatMap((q) => q.choices!)
        .filter((c) => c.toLowerCase() !== correct.toLowerCase() && !wrongs.includes(c));

      if (sameCatPool.length > 0) {
        const shuffledWrongs = shuffle(wrongs);
        shuffledWrongs[0] = shuffle(sameCatPool)[0];
        return shuffle([correct, ...shuffledWrongs.slice(0, count - 1)]);
      }
    }

    return shuffle([correct, ...shuffle(wrongs).slice(0, count - 1)]);
  }

  // For fill-in-blank questions without choices, generate distractors from other answers
  const correctAnswer = targetQuestion.answer.includes(',')
    ? targetQuestion.answer.split(',')[0]
    : targetQuestion.answer;

  const sameCat = allQuestions.filter(
    (q) => q.cat === targetQuestion.cat && q !== targetQuestion
  );
  const getAnswer = (q: Question) => q.answer.includes(',') ? q.answer.split(',')[0] : q.answer;
  let pool = sameCat.map(getAnswer).filter((a) => a !== correctAnswer);

  if (pool.length < count - 1) {
    const allAnswers = allQuestions
      .filter((q) => q !== targetQuestion)
      .map(getAnswer)
      .filter((a) => a !== correctAnswer);
    pool = [...new Set([...pool, ...allAnswers])];
  }

  if (previousDistractors && previousDistractors.length > 0) {
    const fresh = pool.filter((d) => !previousDistractors.includes(d));
    if (fresh.length > 0) {
      const kept = shuffle(previousDistractors).slice(0, count - 2);
      const needed = count - 1 - kept.length;
      const newOnes = shuffle(fresh).slice(0, needed);
      const distractors = shuffle([...kept, ...newOnes]).slice(0, count - 1);
      return shuffle([correctAnswer, ...distractors]);
    }
  }

  const distractors = shuffle(pool).slice(0, count - 1);
  return shuffle([correctAnswer, ...distractors]);
}

export function updateAfterAnswer(
  progress: QuestionProgress,
  correct: boolean,
  currentRound: number
): QuestionProgress {
  const updated = { ...progress };
  updated.totalAttempts++;
  updated.lastSeenRound = currentRound;

  if (correct) {
    updated.correctStreak++;
    if (updated.correctStreak >= MASTERY_THRESHOLD) {
      updated.mastered = true;
    }
  } else {
    updated.correctStreak = 0;
    updated.totalMisses++;
    updated.lastMissRound = currentRound;
  }

  return updated;
}

export function isSessionComplete(progress: QuestionProgress[]): boolean {
  return progress.every((p) => p.mastered);
}

export function getMasteredCount(progress: QuestionProgress[]): number {
  return progress.filter((p) => p.mastered).length;
}
