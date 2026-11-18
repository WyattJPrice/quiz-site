'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  GAMES_ENTRY,
  ensureGames,
  ensureWorker,
  hasGames,
  setArchiveOffline,
} from '@/lib/offline-games';
import { isOffline } from '@/lib/offline-status';

/**
 * Hidden offline games overlay.
 *
 * Ctrl+Shift+G (closed) downloads and caches the archive; Ctrl+Shift+G (open)
 * destroys the overlay. Typing 0000 into the quiz search box opens it, but only
 * while the browser is offline. Any return to the online state tears the whole
 * overlay out of the DOM.
 */

const OPEN_EVENT = 'study:games';

export default function OfflineGames() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const openRef = useRef(false);
  const busyRef = useRef(false);
  const shortcutRef = useRef<(event: KeyboardEvent) => void>(() => {});

  const close = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    void setArchiveOffline(false);
  }, []);

  const openOverlay = useCallback(async () => {
    if (openRef.current) return;
    try {
      if (!(await hasGames())) return;
      // The caller has already established that the device is offline.
      await setArchiveOffline(true);
      openRef.current = true;
      setOpen(true);
    } catch {
      // Stay invisible if anything is missing.
    }
  }, []);

  const prepare = useCallback(async () => {
    if (busyRef.current) return;
    if (await hasGames()) {
      toast.success('Offline content ready', { duration: 1200 });
      return;
    }
    busyRef.current = true;

    const id = 'offline-prep';
    let lastShown = 0;
    toast.loading('Preparing offline content…', { id, duration: Infinity });

    try {
      await ensureGames((progress) => {
        const now = Date.now();
        if (now - lastShown < 250) return;
        lastShown = now;
        const message =
          progress.phase === 'download'
            ? `Downloading… ${
                progress.total
                  ? `${Math.round((progress.loaded / progress.total) * 100)}%`
                  : `${Math.round(progress.loaded / 1048576)} MB`
              }`
            : `Preparing… ${progress.files} files`;
        toast.loading(message, { id, duration: Infinity });
      });
      toast.success('Offline content ready', { id, duration: 1800 });
    } catch {
      toast.error('Could not prepare offline content', { id, duration: 2500 });
    } finally {
      busyRef.current = false;
    }
  }, []);

  const handleShortcut = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey) return;
      if (!event.ctrlKey || !event.shiftKey) return;
      if ((event.key || '').toLowerCase() !== 'g') return;

      event.preventDefault();
      event.stopPropagation();

      if (openRef.current) {
        close();
        return;
      }
      void prepare();
    },
    [close, prepare]
  );

  useEffect(() => {
    shortcutRef.current = handleShortcut;
  }, [handleShortcut]);

  useEffect(() => {
    setMounted(true);

    // Drop the earlier site-wide worker. It controlled `/` (and therefore page
    // loads) and is no longer used; the archive worker is scoped to `/v/`.
    void (async () => {
      try {
        if (!('serviceWorker' in navigator)) return;
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          const script =
            registration.active?.scriptURL ??
            registration.waiting?.scriptURL ??
            registration.installing?.scriptURL;
          if (script && new URL(script).pathname === '/sw.js') {
            await registration.unregister();
          }
        }
      } catch {
        // Nothing to clean up.
      }

      // Moving the worker to a narrower scope needs one online visit. If the
      // archive is already downloaded, install it now so offline still works.
      try {
        if (navigator.onLine && (await hasGames())) await ensureWorker();
      } catch {
        // Retried on the next download or open.
      }
    })();

    const onKeyDown = (event: KeyboardEvent) => shortcutRef.current(event);
    const onOnline = () => close();
    const onOpenRequest = () => {
      void openOverlay();
    };

    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('online', onOnline);
    window.addEventListener(OPEN_EVENT, onOpenRequest);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('online', onOnline);
      window.removeEventListener(OPEN_EVENT, onOpenRequest);
    };
  }, [close, openOverlay]);

  // Reconnection must tear the games down with no user input. The `online`
  // event can be missing (virtual adapters keep navigator.onLine true), so poll
  // the real connection state while the overlay is up.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let checking = false;

    const check = async () => {
      if (cancelled || checking) return;
      checking = true;
      try {
        if (!(await isOffline())) close();
      } catch {
        // Treat a failed probe as still offline.
      } finally {
        checking = false;
      }
    };

    const id = window.setInterval(() => void check(), 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [open, close]);

  // Keep the page behind the overlay from scrolling, so only the games have a
  // scrollbar.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
    };
  }, [open]);

  // Keys pressed while a game has focus never bubble to the parent document,
  // so mirror the shortcut inside the same-origin iframe on every load.
  const bindFrame = useCallback(() => {
    frameRef.current?.focus();
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    doc.addEventListener(
      'keydown',
      (event) => shortcutRef.current(event),
      true
    );
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black">
      <iframe
        ref={frameRef}
        src={GAMES_ENTRY}
        title="Offline content"
        onLoad={bindFrame}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads allow-pointer-lock"
        allow="fullscreen; autoplay; gamepad"
      />
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="fixed top-2 right-2 z-[201] flex size-8 items-center justify-center rounded-full bg-black/40 text-lg leading-none text-white/50 transition-colors hover:bg-black/70 hover:text-white"
      >
        ×
      </button>
    </div>,
    document.body
  );
}
