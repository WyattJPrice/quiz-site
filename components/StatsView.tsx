'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Sidebar, { type ShellUser } from './Sidebar';
import GuestSync from './GuestSync';
import ThemeToggle from './ThemeToggle';
import { loadGuestStats, type GuestStats } from '@/lib/guest-stats';
import type { UserStats } from '@/db/stats';

export interface SetMeta {
  title: string;
  subject: string;
}

const EMPTY: UserStats = {
  answered: 0,
  correct: 0,
  setsFinished: 0,
  accuracy: 0,
  subjects: [],
  recent: [],
  daily: [],
};

function lastSevenDayKeys(): string[] {
  const keys: string[] = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    keys.push(day.toISOString().slice(0, 10));
  }

  return keys;
}

/** Guest numbers are stored per finished set, so they rebuild the same shape. */
function guestToStats(guest: GuestStats | null, setMeta: Record<string, SetMeta>): UserStats {
  if (!guest) return EMPTY;

  const subjectTotals = new Map<string, { answered: number; correct: number }>();
  for (const result of guest.results) {
    const subject = setMeta[result.slug]?.subject ?? 'Other';
    const previous = subjectTotals.get(subject) ?? { answered: 0, correct: 0 };
    subjectTotals.set(subject, {
      answered: previous.answered + result.answered,
      correct: previous.correct + result.correct,
    });
  }

  const dailyTotals = new Map<string, { answered: number; correct: number }>();
  for (const result of guest.results) {
    const day = result.at.slice(0, 10);
    const previous = dailyTotals.get(day) ?? { answered: 0, correct: 0 };
    dailyTotals.set(day, {
      answered: previous.answered + result.answered,
      correct: previous.correct + result.correct,
    });
  }

  const daily = lastSevenDayKeys().map((day) => ({ day, ...(dailyTotals.get(day) ?? { answered: 0, correct: 0 }) }));

  return {
    answered: guest.answered,
    correct: guest.correct,
    setsFinished: guest.results.length,
    accuracy: guest.answered > 0 ? Math.round((guest.correct / guest.answered) * 100) : 0,
    subjects: [...subjectTotals.entries()].map(([name, value]) => ({ name, ...value })),
    recent: [...guest.results].reverse().slice(0, 10).map((result) => ({
      slug: result.slug,
      title: setMeta[result.slug]?.title ?? result.slug,
      mode: result.mode,
      answered: result.answered,
      correct: result.correct,
      at: result.at,
    })),
    daily,
  };
}

function formatDay(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function StatsView({
  user,
  serverStats,
  setMeta,
}: {
  user: ShellUser | null;
  serverStats: UserStats | null;
  setMeta: Record<string, SetMeta>;
}) {
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);

  useEffect(() => {
    if (!user) setGuestStats(loadGuestStats());
  }, [user]);

  const stats = useMemo(() => {
    if (user) return serverStats ?? EMPTY;
    return guestToStats(guestStats, setMeta);
  }, [user, serverStats, guestStats, setMeta]);

  const maxDaily = Math.max(...stats.daily.map((day) => day.answered), 1);
  const maxSubject = Math.max(...stats.subjects.map((subject) => subject.answered), 1);

  return (
    <div className="library-app">
      <GuestSync signedIn={Boolean(user)} />
      <Sidebar user={user} active="stats" />

      <main className="library-main">
        <div className="library-main-inner">
          <header className="page-head">
            <div>
              <p className="page-eyebrow">{user ? 'Your account' : 'This browser only'}</p>
              <h1 className="page-title">Your stats</h1>
              <p className="page-subtitle">
                {user
                  ? 'Everything you have answered correctly, on every device.'
                  : 'Saved in this browser until you sign in.'}
              </p>
            </div>
            <ThemeToggle inline />
          </header>

          {!user ? (
            <div className="stats-callout">
              <p>
                {stats.answered > 0
                  ? `You have answered ${stats.answered} question${stats.answered === 1 ? '' : 's'} here. Sign in and they move into your account.`
                  : 'Sign in to keep your correct answers, progress and leaderboard place across devices.'}
              </p>
              <Link className="stats-callout-action" href="/signin">
                Continue with Google
              </Link>
            </div>
          ) : null}

          <div className="stats-grid">
            <div className="stats-card">
              <span className="stats-value">{stats.correct}</span>
              <span className="stats-label">Correct answers</span>
            </div>
            <div className="stats-card">
              <span className="stats-value">{stats.answered}</span>
              <span className="stats-label">Questions answered</span>
            </div>
            <div className="stats-card">
              <span className="stats-value">{stats.accuracy}%</span>
              <span className="stats-label">Accuracy</span>
            </div>
            <div className="stats-card">
              <span className="stats-value">{stats.setsFinished}</span>
              <span className="stats-label">Sets finished</span>
            </div>
          </div>

          <div className="stats-columns">
            <section className="stats-panel" aria-labelledby="stats-subjects">
              <h2 id="stats-subjects" className="stats-panel-title">
                By subject
              </h2>
              {stats.subjects.length === 0 ? (
                <p className="stats-empty">Finish a set to see subject totals here.</p>
              ) : (
                <ul className="stats-bars">
                  {stats.subjects.map((subject) => (
                    <li key={subject.name} className="stats-bar-row">
                      <span className="stats-bar-name">{subject.name}</span>
                      <span className="stats-bar-track">
                        <span
                          className="stats-bar-fill"
                          style={{ width: `${Math.round((subject.answered / maxSubject) * 100)}%` }}
                        />
                      </span>
                      <span className="stats-bar-value">
                        {subject.correct}/{subject.answered}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="stats-panel" aria-labelledby="stats-week">
              <h2 id="stats-week" className="stats-panel-title">
                Last 7 days
              </h2>
              <div className="stats-week" role="img" aria-label="Answers per day over the last week">
                {stats.daily.map((day) => (
                  <div key={day.day} className="stats-week-col">
                    <span className="stats-week-bar-wrap">
                      <span
                        className="stats-week-bar"
                        style={{ height: `${Math.max(6, Math.round((day.answered / maxDaily) * 100))}%` }}
                      />
                    </span>
                    <span className="stats-week-label">{formatDay(day.day)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="stats-panel stats-recent" aria-labelledby="stats-recent">
            <h2 id="stats-recent" className="stats-panel-title">
              Recent sets
            </h2>
            {stats.recent.length === 0 ? (
              <p className="stats-empty">No finished sets yet.</p>
            ) : (
              <ul className="stats-recent-list">
                {stats.recent.map((result, index) => (
                  <li key={`${result.slug}-${result.at}-${index}`} className="stats-recent-row">
                    <Link href={`/learn/${result.slug}`} className="stats-recent-title">
                      {result.title}
                    </Link>
                    <span className="stats-recent-mode">{result.mode === 'test' ? 'Test' : 'Learn'}</span>
                    <span className="stats-recent-score">
                      {result.correct}/{result.answered} correct
                    </span>
                    <span className="stats-recent-date">{formatDateTime(result.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
