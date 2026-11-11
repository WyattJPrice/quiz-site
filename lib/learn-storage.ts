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
    // Stamp every write so the server copy can be compared with this one.
    const stamped: LearnSessionState = { ...state, updatedAt: Date.now() };
    localStorage.setItem(KEY_PREFIX + stamped.slug, JSON.stringify(stamped));
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
