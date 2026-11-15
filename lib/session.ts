'use client';

import { authClient } from '@/lib/auth/client';

export { authClient };

export function getFirstName(name: string | null | undefined): string {
  if (!name) return 'Player';
  return name.trim().split(' ')[0] || 'Player';
}

export function signInWithGoogle(): Promise<void> {
  return fetch('/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', callbackURL: window.location.href }),
  })
    .then((r) => r.json())
    .then((d: { url?: string }) => {
      if (d?.url) {
        window.location.href = d.url;
        return;
      }
      throw new Error('no url');
    });
}
