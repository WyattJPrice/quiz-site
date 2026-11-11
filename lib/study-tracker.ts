'use client';

import { recordGuestResult, type StudyMode } from './guest-stats';

export interface FinishedSet {
  slug: string;
  mode: StudyMode;
  answered: number;
  correct: number;
}

/**
 * A finished set goes to the account when signed in and to localStorage when
 * not. Guest numbers are merged into the account on the next sign-in.
 */
export async function recordFinishedSet(
  signedIn: boolean,
  set: FinishedSet,
): Promise<{ saved: boolean }> {
  if (!signedIn) {
    recordGuestResult(set);
    return { saved: false };
  }

  try {
    const response = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(set),
    });
    return { saved: response.ok };
  } catch {
    return { saved: false };
  }
}

/** Persist learn progress for another device, debounced by the caller. */
export async function saveServerProgress(slug: string, state: unknown): Promise<void> {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, state }),
    });
  } catch {
    // Offline or signed out; local progress still holds.
  }
}

/** Import guest work once per browser into the signed-in account. */
export async function mergeGuestWork(deviceId: string): Promise<boolean> {
  const stats = (await import('./guest-stats')).loadGuestStats();
  const progress = (await import('./guest-stats')).guestProgressSnapshots();

  if (stats.answered === 0 && stats.results.length === 0 && progress.length === 0) return false;

  try {
    const response = await fetch('/api/guest/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        results: stats.results,
        progress,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
