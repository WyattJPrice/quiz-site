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
