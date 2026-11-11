'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, Library, Pencil, Plus } from 'lucide-react';
import { signInWithGoogle, signOutAction } from '@/app/actions';

export interface ShellUser {
  id: string;
  displayName: string | null;
  name: string | null;
  image: string | null;
}

const NAV = [
  { id: 'library' as const, label: 'Library', href: '/', icon: Library },
  { id: 'stats' as const, label: 'Stats', href: '/stats', icon: BarChart3 },
];

function GoogleMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * The navy study rail: the (coming soon) new-set button, Library and Stats, and
 * a Google profile menu. Signed out, the default avatar opens a sign in / sign
 * up prompt instead of putting a text link in the bar. The rename contract is
 * classlink's, enforced by the API.
 */
export default function Sidebar({ user, active }: { user: ShellUser | null; active: 'library' | 'stats' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState(user?.displayName ?? '');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.displayName ?? '');
  }, [user?.displayName]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setOpen(false);
    setEditing(false);
    setError('');
  }, [pathname]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3600);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        setEditing(false);
        setError('');
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        setEditing(false);
        setError('');
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const label = name.trim() || user?.name?.trim() || '';
  const initial = (label || 'S').charAt(0).toUpperCase();

  function toggleMenu() {
    setOpen((value) => !value);
    setEditing(false);
    setError('');
  }

  function startEditing() {
    setDraft(label);
    setError('');
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(label);
    setError('');
    setEditing(false);
  }

  async function save() {
    const next = draft.trim();

    if (!next) {
      setError('Name cannot be empty.');
      return;
    }
    if (next.length > 30) {
      setError('Name is too long (max 30 characters).');
      return;
    }
    if (next === label) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/profile/display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: next }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; name?: string };

      if (!response.ok) {
        setError(data.error || 'Could not save that name.');
        return;
      }

      setName(data.name || next);
      setEditing(false);
      router.refresh();
    } catch {
      setError('Could not save that name.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="library-sidebar">
      <div className="rail-add-wrap">
        <button
          type="button"
          className="rail-add"
          aria-label="New study set"
          onClick={() => setNotice('Study set creation is coming soon.')}
        >
          <Plus size={22} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {notice ? (
          <p className="rail-notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>

      <nav className="rail-nav" aria-label="Study sections">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="rail-nav-item"
              aria-current={active === item.id ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rail-profile" ref={menuRef}>
        <button
          type="button"
          className={`rail-avatar rail-avatar-btn${open ? ' is-open' : ''}`}
          aria-label={user ? 'Account menu' : 'Sign in or sign up with Google'}
          aria-expanded={open}
          onClick={toggleMenu}
        >
          {user ? (
            user.image ? (
              // Google profile picture; plain img keeps the Next image config untouched.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="rail-avatar-img"
                referrerPolicy="no-referrer"
                width={38}
                height={38}
              />
            ) : (
              <span aria-hidden="true">{initial}</span>
            )
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="12" cy="8.5" r="3.6" />
              <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {open ? (
          <div className="profile-menu" aria-label={user ? 'Account' : 'Sign in'}>
            {user ? (
              <>
                {editing ? (
                  <form
                    className="profile-menu-edit"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void save();
                    }}
                  >
                    <input
                      ref={inputRef}
                      className="profile-menu-input"
                      value={draft}
                      maxLength={30}
                      aria-label="Your username"
                      placeholder="Display name"
                      disabled={saving}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          event.preventDefault();
                          cancelEditing();
                        }
                      }}
                    />
                    <button type="submit" className="profile-menu-save" disabled={saving || !draft.trim()}>
                      {saving ? '…' : 'Save'}
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="profile-menu-name"
                    onClick={startEditing}
                    title="Edit your username"
                  >
                    <span>{label || 'Set a username'}</span>
                    <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                )}

                {error ? (
                  <p className="profile-menu-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <form action={signOutAction}>
                  <button type="submit" className="profile-menu-signout">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="profile-menu-title">Save your progress</p>
                <p className="profile-menu-copy">
                  Sign in or sign up with Google to keep your correct answers and pick up on any device.
                </p>
                <form action={signInWithGoogle}>
                  <input type="hidden" name="redirectTo" value={pathname || '/'} />
                  <button type="submit" className="profile-menu-google">
                    <GoogleMark />
                    Continue with Google
                  </button>
                </form>
              </>
            )}
          </div>
        ) : null}
      </div>

      <p className="sidebar-credit">
        Created by{' '}
        <a href="https://wyattprice.dev" target="_blank" rel="noreferrer">
          Wyatt Price
        </a>
      </p>
    </aside>
  );
}
