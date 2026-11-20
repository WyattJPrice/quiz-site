import type { LearnSessionState } from './learn-types';

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

/**
 * Coerces untrusted saved state (from storage or the profile API) into a usable
 * session. Returns null when it no longer fits the set, so the round restarts
 * instead of resuming into the wrong questions.
 */
export function sanitizeLearnSession(
  raw: unknown,
  slug: string,
  total: number
): LearnSessionState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<LearnSessionState>;

  const indices = (value: unknown): number[] | null => {
    if (!Array.isArray(value)) return null;
    const out: number[] = [];
    for (const item of value) {
      const n = Math.floor(Number(item));
      if (!Number.isInteger(n) || n < 0 || n >= total) return null;
      out.push(n);
    }
    return out;
  };

  const remaining = indices(s.remaining);
  const wrongPile = indices(s.wrongPile);
  if (!remaining || !wrongPile) return null;
  if (remaining.length === 0) return null;
  if (remaining.length + wrongPile.length > total) return null;

  const currentIdx = Math.floor(Number(s.currentIdx));
  if (!Number.isInteger(currentIdx) || currentIdx < 0 || currentIdx >= remaining.length) {
    return null;
  }

  const count = (value: unknown) => {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const round = Math.floor(Number(s.round));
  const updatedAt = Math.floor(Number(s.updatedAt));
  const roundNumber = Number.isInteger(round) && round > 0 ? round : 1;

  const categories = Array.isArray(s.categories)
    ? Array.from(
        new Set(s.categories.filter((cat): cat is string => typeof cat === 'string' && cat.length > 0))
      )
    : [];

  // Older saves predate totalQuestions. In round 1 `remaining` is still the
  // full filtered set, so its length is the studied count.
  const savedTotal = Math.floor(Number(s.totalQuestions));
  const totalQuestions =
    Number.isInteger(savedTotal) && savedTotal >= remaining.length
      ? savedTotal
      : roundNumber === 1
        ? remaining.length
        : undefined;

  return {
    slug,
    remaining,
    wrongPile,
    currentIdx,
    round: roundNumber,
    totalCorrect: count(s.totalCorrect),
    totalWrong: count(s.totalWrong),
    ...(categories.length > 0 ? { categories } : {}),
    ...(totalQuestions !== undefined ? { totalQuestions } : {}),
    updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : 0,
  };
}

const KNOWN_KEY_PREFIX = 'learn-known-';

export function getKnownIndices(slug: string): number[] {
  try {
    const raw = localStorage.getItem(KNOWN_KEY_PREFIX + slug);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addKnownIndex(slug: string, idx: number): void {
  try {
    const known = new Set(getKnownIndices(slug));
    known.add(idx);
    localStorage.setItem(
      KNOWN_KEY_PREFIX + slug,
      JSON.stringify([...known])
    );
  } catch {
    // ignore
  }
}
