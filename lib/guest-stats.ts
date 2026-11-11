'use client';

const DEVICE_KEY = 'study-guest-device';
const STATS_KEY = 'study-guest-stats';
const PROGRESS_PREFIX = 'learn-progress-';

export type StudyMode = 'learn' | 'test';

export interface GuestResult {
  slug: string;
  mode: StudyMode;
  answered: number;
  correct: number;
  at: string;
}

export interface GuestStats {
  answered: number;
  correct: number;
  bySet: Record<string, { answered: number; correct: number }>;
  results: GuestResult[];
  updatedAt: string;
}

function emptyStats(): GuestStats {
  return { answered: 0, correct: 0, bySet: {}, results: [], updatedAt: new Date(0).toISOString() };
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable; the session still works without persistence.
  }
}

/** A stable id for this browser, used to merge guest work exactly once. */
export function guestDeviceId(): string {
  const existing = readStorage(DEVICE_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  writeStorage(DEVICE_KEY, id);
  return id;
}

export function loadGuestStats(): GuestStats {
  const raw = readStorage(STATS_KEY);
  if (!raw) return emptyStats();

  try {
    const parsed = JSON.parse(raw) as Partial<GuestStats>;
    return {
      answered: Number(parsed.answered) || 0,
      correct: Number(parsed.correct) || 0,
      bySet: parsed.bySet && typeof parsed.bySet === 'object' ? parsed.bySet : {},
      results: Array.isArray(parsed.results) ? parsed.results : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return emptyStats();
  }
}

export function hasGuestWork(): boolean {
  const stats = loadGuestStats();
  return stats.answered > 0 || stats.results.length > 0 || guestProgressSnapshots().length > 0;
}

export function recordGuestResult(input: {
  slug: string;
  mode: StudyMode;
  answered: number;
  correct: number;
}): GuestStats {
  const stats = loadGuestStats();
  const at = new Date().toISOString();
  const answered = Math.max(0, Math.round(input.answered));
  const correct = Math.min(Math.max(0, Math.round(input.correct)), answered);

  const previous = stats.bySet[input.slug] ?? { answered: 0, correct: 0 };

  const next: GuestStats = {
    answered: stats.answered + answered,
    correct: stats.correct + correct,
    bySet: {
      ...stats.bySet,
      [input.slug]: {
        answered: previous.answered + answered,
        correct: previous.correct + correct,
      },
    },
    results: [...stats.results, { slug: input.slug, mode: input.mode, answered, correct, at }].slice(-200),
    updatedAt: at,
  };

  writeStorage(STATS_KEY, JSON.stringify(next));
  return next;
}

export interface GuestProgressSnapshot {
  slug: string;
  state: unknown;
  updatedAt: string;
}

/** Guest learn progress already lives in `learn-progress-<slug>` keys. */
export function guestProgressSnapshots(): GuestProgressSnapshot[] {
  const snapshots: GuestProgressSnapshot[] = [];

  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(PROGRESS_PREFIX)) continue;

      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      try {
        const state = JSON.parse(raw) as { updatedAt?: number };
        const slug = key.slice(PROGRESS_PREFIX.length);
        snapshots.push({
          slug,
          state,
          updatedAt: new Date(state?.updatedAt ?? Date.now()).toISOString(),
        });
      } catch {
        // Skip unreadable progress instead of failing the whole merge.
      }
    }
  } catch {
    return [];
  }

  return snapshots;
}

/** Keep the device id; drop the guest stats and guest progress after a merge. */
export function clearGuestData(): void {
  try {
    writeStorage(STATS_KEY, JSON.stringify(emptyStats()));

    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PROGRESS_PREFIX)) keys.push(key);
    }
    for (const key of keys) window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
