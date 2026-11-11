'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Shown at the end of every finished set while signed out: the answers count
 * towards guest stats in localStorage until the student signs in.
 */
export default function SaveStatsToast({
  answered,
  onClose,
}: {
  answered: number;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="save-toast" role="status" aria-live="polite">
      <div className="save-toast-body">
        <p className="save-toast-title">
          {answered} question{answered === 1 ? '' : 's'} answered
        </p>
        <p className="save-toast-copy">
          Sign in to save them to your account and pick up on any device.
        </p>
      </div>
      <Link className="save-toast-action" href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}>
        Continue with Google
      </Link>
      <button type="button" className="save-toast-close" onClick={onClose} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
