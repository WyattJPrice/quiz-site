/**
 * A paused round of a study set.
 *
 * Saved on the device (so closing Safari and coming back works instantly) and on
 * the student's profile (so the same round resumes on another device).
 */
export interface QuizSession {
  /** Deck order, stored as indices into the set's full question list. */
  order: number[];
  /** Position in the deck to resume at. */
  idx: number;
  correct: number;
  wrong: number;
  /** Selected categories; null means every category is active. */
  cats: string[] | null;
  /** Question count the state was saved against, used to detect an edited set. */
  total: number;
  updatedAt: number;
}

const KEY_PREFIX = 'quiz-session-';

export function loadQuizSession(slug: string): QuizSession | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slug);
    if (!raw) return null;
    return sanitizeQuizSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveQuizSession(slug: string, state: QuizSession): void {
  try {
    localStorage.setItem(KEY_PREFIX + slug, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export function clearQuizSession(slug: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + slug);
  } catch {
    // ignore
  }
}

/** Coerces untrusted saved state (from storage or the API) into a usable session. */
export function sanitizeQuizSession(raw: unknown): QuizSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<QuizSession>;

  if (!Array.isArray(s.order)) return null;
  const order = s.order
    .map((n) => Math.floor(Number(n)))
    .filter((n) => Number.isInteger(n) && n >= 0);

  const total = Math.floor(Number(s.total));
  const idx = Math.floor(Number(s.idx));
  if (!Number.isFinite(total) || total <= 0) return null;
  if (!Number.isFinite(idx) || idx < 0) return null;

  const count = (value: unknown) => {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const cats = Array.isArray(s.cats)
    ? s.cats.filter((c): c is string => typeof c === 'string')
    : [];
  const updatedAt = Math.floor(Number(s.updatedAt));

  return {
    order,
    idx,
    correct: count(s.correct),
    wrong: count(s.wrong),
    cats: cats.length > 0 ? cats : null,
    total,
    updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : 0,
  };
}
