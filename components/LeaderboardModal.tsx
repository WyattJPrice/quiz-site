'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { authClient } from '@/lib/session';

const MEDALS = ['🥇', '🥈', '🥉'];

interface Entry {
  firstName: string;
  count: number;
  you?: boolean;
}

interface LeaderboardData {
  entries: Entry[];
  communityTotal: number;
  students: number;
  you: { count: number; rank: number } | null;
}

export default function LeaderboardModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = authClient.useSession();
  const signedIn = !!session?.user;
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d: LeaderboardData) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, signedIn]);

  const entries = data
    ? signedIn && data.you && !data.entries.some((e) => e.you)
      ? [...data.entries, { firstName: 'You', count: data.you.count, you: true }]
      : data.entries
    : [];
  const sorted = [...entries].sort((a, b) => b.count - a.count);
  const communityTotal = data?.communityTotal ?? 0;
  const students = data?.students ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85vh,540px)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-0">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Leaderboard
          </DialogTitle>
          <DialogDescription className="sr-only">
            Ranked list of students by questions answered.
          </DialogDescription>
        </div>

        <div className="flex gap-6 border-b border-border px-6 pb-3.5">
          <div>
            {loading ? (
              <span className="block h-7 w-14 rounded-md bg-muted animate-pulse" />
            ) : (
              <b className="block text-xl font-bold tabular-nums">
                {communityTotal.toLocaleString()}
              </b>
            )}
            <span className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              questions answered
            </span>
          </div>
          <div>
            {loading ? (
              <span className="block h-7 w-10 rounded-md bg-muted animate-pulse" />
            ) : (
              <b className="block text-xl font-bold tabular-nums">{sorted.length}</b>
            )}
            <span className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              students
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1.75rem_1.5rem_1fr_auto] items-center gap-2.5 border-b border-border px-2.5 py-2.5 last:border-b-0"
                >
                  <div
                    className="mx-auto size-4 rounded bg-muted animate-pulse"
                    style={{ animationDelay: `${i * 75}ms` }}
                  />
                  <div
                    className="size-6 rounded-full bg-muted animate-pulse"
                    style={{ animationDelay: `${i * 75}ms` }}
                  />
                  <div
                    className="h-3.5 rounded bg-muted animate-pulse"
                    style={{ animationDelay: `${i * 75}ms`, maxWidth: `${80 - i * 6}px` }}
                  />
                  <div
                    className="h-3.5 w-10 rounded bg-muted animate-pulse"
                    style={{ animationDelay: `${i * 75}ms` }}
                  />
                </div>
              ))}
            </div>
          )}
          {!loading && sorted.map((e, i) => (
            <div
              key={`${e.firstName}-${i}`}
              className={`grid grid-cols-[1.75rem_1.5rem_1fr_auto] items-center gap-2.5 border-b border-border px-2.5 py-2.5 last:border-b-0 ${
                e.you
                  ? 'bg-primary/5 outline outline-1 -outline-offset-1 outline-primary/25'
                  : ''
              }`}
            >
              <span className="text-center text-[13px] font-semibold tabular-nums text-muted-foreground">
                {i < 3 ? (
                  <span className="text-sm">{MEDALS[i]}</span>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  e.you
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                {e.firstName[0]}
              </span>
              <span className="truncate text-sm font-medium">
                {e.firstName}
                {e.you && (
                  <span className="ml-1.5 text-[10px] font-semibold tracking-[0.05em] text-primary">
                    YOU
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {e.count.toLocaleString()}
              </span>
            </div>
          ))}
          {!loading && sorted.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No one has answered questions yet. Be the first!
            </p>
          )}
          {!signedIn && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sign in to appear on the leaderboard.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
