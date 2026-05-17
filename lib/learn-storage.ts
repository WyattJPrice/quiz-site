import type { LearnSessionState, QuestionProgress } from './learn-types';

const KEY_PREFIX = 'learn-progress-';

export function loadProgress(slug: string): LearnSessionState | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slug);
    if (!raw) return null;
    return JSON.parse(raw) as LearnSessionState;
  } catch {
    return null;
  }
}

export function saveProgress(state: LearnSessionState): void {
  try {
    state.lastUpdatedAt = new Date().toISOString();
    localStorage.setItem(KEY_PREFIX + state.slug, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function resetProgress(slug: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + slug);
  } catch {
    // ignore
  }
}

export function hasProgress(slug: string): boolean {
  try {
    return localStorage.getItem(KEY_PREFIX + slug) !== null;
  } catch {
    return false;
  }
}

export function createFreshState(slug: string, questionCount: number): LearnSessionState {
  const now = new Date().toISOString();
  const questionsProgress: QuestionProgress[] = Array.from({ length: questionCount }, (_, i) => ({
    questionIndex: i,
    correctStreak: 0,
    totalAttempts: 0,
    totalMisses: 0,
    lastMissRound: null,
    lastSeenRound: -1,
    mastered: false,
    lastDistractors: null,
  }));

  return {
    slug,
    round: 0,
    questionsProgress,
    startedAt: now,
    lastUpdatedAt: now,
  };
}
