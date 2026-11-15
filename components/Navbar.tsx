'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import LeaderboardModal from '@/components/LeaderboardModal';
import { authClient, getFirstName, signInWithGoogle } from '@/lib/session';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* Exact trophy icon + sizing from Connections */
function TrophyIcon({ width = 20, height = 20 }: { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M17 4h3v3a3 3 0 0 1-3 3" />
      <path d="M7 4H4v3a3 3 0 0 0 3 3" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';

const ADMIN_EMAILS = ['wyattprice09ono@gmail.com', '28wprice@ndpios.com'];

export default function Navbar() {
  const [lbOpen, setLbOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const user = session?.user;
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  function handleGoogleSignIn() {
    signInWithGoogle().catch(() => toast.error('Sign-in failed. Try again.'));
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Study<span className="text-primary">.</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLbOpen(true)}
              className={iconBtn}
              aria-label="Leaderboard"
            >
              <TrophyIcon />
            </button>

            {isAdmin && (
              <Link href="/create" className={iconBtn} aria-label="Create a set">
                <Plus className="size-5" />
              </Link>
            )}

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger render={<button className={iconBtn} aria-label="Account" />}>
                {user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.image}
                    alt=""
                    className="size-7 rounded-full border border-border object-cover"
                  />
                ) : user ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {getFirstName(user.name)[0].toUpperCase()}
                  </span>
                ) : (
                  <User className="size-5" strokeWidth={2} />
                )}
              </DropdownMenuTrigger>
              {user ? (
                <DropdownMenuContent align="end" className="w-64 p-0">
                  <div className="px-4 pt-3.5 pb-3">
                    <p className="truncate text-sm font-semibold">
                      {getFirstName(user.name)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuItem
                    className="m-2 mt-0 flex cursor-pointer items-center justify-center border border-input bg-secondary px-4 py-2 text-sm font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              ) : (
                <DropdownMenuContent align="end" className="w-64 p-0">
                  <div className="px-4 pt-3.5 pb-3">
                    <p className="text-sm font-semibold">Sign in</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Save progress across devices and appear on the leaderboard.
                    </p>
                  </div>
                  <DropdownMenuItem
                    className="m-2 mt-0 flex cursor-pointer items-center justify-center gap-2.5 border border-input bg-secondary px-4 py-2 text-sm font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <LeaderboardModal open={lbOpen} onOpenChange={setLbOpen} />
    </>
  );
}
