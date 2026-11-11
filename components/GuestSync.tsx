'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearGuestData, guestDeviceId, hasGuestWork } from '@/lib/guest-stats';
import { mergeGuestWork } from '@/lib/study-tracker';

/**
 * Runs once per browser after a sign-in: the guest answers and guest learn
 * progress recorded before signing in are imported, then cleared locally. The
 * server claims the device id, so a replay cannot double-count.
 */
export default function GuestSync({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!signedIn || started.current) return;

    let cancelled = false;
    started.current = true;

    async function run() {
      if (!hasGuestWork()) return;
      const merged = await mergeGuestWork(guestDeviceId());
      if (cancelled || !merged) return;

      clearGuestData();
      router.refresh();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [signedIn, router]);

  return null;
}
