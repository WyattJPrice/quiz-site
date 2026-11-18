'use client';

/** Kinds of progress that can be stored on a student's profile. */
export type SessionKind = 'quiz' | 'learn';

function endpoint(slug: string, kind: SessionKind): string {
  return `/api/quiz-session?slug=${encodeURIComponent(slug)}&kind=${kind}`;
}

/** Reads the saved session for this user + set. Never throws. */
export async function pullSession(
  slug: string,
  kind: SessionKind,
  signal?: AbortSignal
): Promise<unknown> {
  try {
    const res = await fetch(endpoint(slug, kind), {
      cache: 'no-store',
      signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { state?: unknown };
    return data?.state ?? null;
  } catch {
    return null;
  }
}

/**
 * Writes the session to the profile. `keepalive` lets the request finish when
 * the page is being closed (iOS Safari included).
 */
export function pushSession(
  slug: string,
  kind: SessionKind,
  state: unknown
): void {
  try {
    void fetch('/api/quiz-session', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, kind, state }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/** Drops the saved session once a round is finished or restarted. */
export function dropSession(slug: string, kind: SessionKind): void {
  try {
    void fetch(endpoint(slug, kind), {
      method: 'DELETE',
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
