'use client';

import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Sidebar, { type ShellUser } from './Sidebar';
import Leaderboard from './Leaderboard';
import GuestSync from './GuestSync';
import type { LibraryData, StudySetSummary, SubjectSummary } from '@/lib/library-types';
import type { LeaderboardData } from '@/db/stats';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Only upcoming, incomplete tests show a date — the same rule the seed and the
 * database use. A past date is never treated as complete.
 */
function upcomingTestLabel(set: StudySetSummary): string | null {
  if (!set.testAt || set.testCompletedAt) return null;

  const todayIso = new Date().toISOString().slice(0, 10);
  if (set.testAt < todayIso) return null;

  const [year, month, day] = set.testAt.split('-').map(Number);
  if (!year || !month || !day) return null;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function SetRow({ set, lastStudied }: { set: StudySetSummary; lastStudied?: string }) {
  const testLabel = upcomingTestLabel(set);
  const studiedLabel = lastStudied ? formatDate(lastStudied) : null;
  const dateLine = testLabel ? `Test: ${testLabel}` : studiedLabel ? `Studied ${studiedLabel}` : null;

  return (
    <article className="set-row">
      <div className="set-row-main">
        <h3 className="set-row-title">
          <Link href={`/learn/${set.slug}`}>{set.title}</Link>
        </h3>
        {set.description ? <p className="set-row-desc">{set.description}</p> : null}
      </div>

      <div className="set-row-meta">
        <span className="set-row-count">{plural(set.questionCount, 'question')}</span>
        {dateLine ? <span className="set-row-date">{dateLine}</span> : null}
      </div>

      <div className="set-row-actions">
        <Link className="row-btn row-btn-primary" href={`/learn/${set.slug}`}>
          Study
        </Link>
        <Link className="row-btn" href={`/quiz/${set.slug}`}>
          Test
        </Link>
      </div>
    </article>
  );
}

function SubjectSections({
  subjects,
  sets,
  collapsed,
  onToggle,
  searching,
  lastStudied,
}: {
  subjects: SubjectSummary[];
  sets: StudySetSummary[];
  collapsed: Set<string>;
  onToggle: (slug: string) => void;
  searching: boolean;
  lastStudied: Record<string, string>;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, StudySetSummary[]>();
    for (const set of sets) {
      const list = map.get(set.subjectSlug) ?? [];
      list.push(set);
      map.set(set.subjectSlug, list);
    }
    return map;
  }, [sets]);

  const visible = subjects.filter((subject) => (grouped.get(subject.slug)?.length ?? 0) > 0);

  return (
    <>
      {visible.map((subject) => {
        const subjectSets = grouped.get(subject.slug) ?? [];
        const isCollapsed = !searching && collapsed.has(subject.slug);
        const panelId = `subject-panel-${subject.slug}`;

        return (
          <section className="subject-section" key={subject.id}>
            <h2 className="subject-head">
              <button
                type="button"
                className="subject-toggle"
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                onClick={() => onToggle(subject.slug)}
              >
                <span className="subject-name">{subject.name}</span>
                <span className="subject-count">{plural(subjectSets.length, 'study set')}</span>
                <ChevronDown
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className={`subject-chevron${isCollapsed ? ' is-collapsed' : ''}`}
                />
              </button>
            </h2>

            {!isCollapsed ? (
              <div id={panelId} className="subject-panel">
                {subjectSets.map((set) => (
                  <SetRow key={set.id} set={set} lastStudied={lastStudied[set.slug]} />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}

function EmptyState({ onReset, query }: { onReset: () => void; query: string }) {
  return (
    <div className="empty-state">
      <p className="empty-title">No study sets found</p>
      <p className="empty-copy">
        {query ? `Nothing matches “${query.trim()}”.` : 'Nothing matches that search.'}
      </p>
      <button type="button" className="empty-reset" onClick={onReset}>
        Clear search
      </button>
    </div>
  );
}

export default function LibraryView({
  library,
  leaderboard,
  user,
  lastStudied,
}: {
  library: LibraryData;
  leaderboard: LeaderboardData;
  user: ShellUser | null;
  lastStudied: Record<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const needle = useDeferredValue(query.trim().toLowerCase());

  const filteredSets = useMemo(
    () =>
      library.sets.filter((set) => {
        if (!needle) return true;
        const haystack = [set.title, set.subjectName, set.description ?? '', ...set.topics]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      }),
    [library.sets, needle],
  );

  const searching = needle.length > 0;

  function toggleSubject(slug: string) {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const notice = library.databaseError
    ? 'The live database is unreachable right now, so this is the bundled study snapshot. Changes may not persist until the connection recovers.'
    : library.source === 'bundled'
      ? 'No database is configured, so this is the bundled study snapshot. Set DATABASE_URL to enable persistent storage.'
      : null;

  return (
    <div className="library-app">
      <GuestSync signedIn={Boolean(user)} />
      <Sidebar user={user} active="library" />

      <main className="library-main">
        <div className="library-main-inner">
          <header className="page-head">
            <div>
              <h1 className="page-title">Your study library</h1>
              <p className="page-subtitle">Pick up where you left off.</p>
            </div>
            <ThemeToggle inline />
          </header>

          <div className="search-wrap">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="Search subjects or topics..."
              aria-label="Search subjects or topics"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {notice ? (
            <p className="db-notice" role="status">
              {notice}
            </p>
          ) : null}

          <div className="library-columns">
            <div className="library-results">
              {filteredSets.length === 0 ? (
                <EmptyState query={query} onReset={() => setQuery('')} />
              ) : (
                <SubjectSections
                  subjects={library.subjects}
                  sets={filteredSets}
                  collapsed={collapsed}
                  onToggle={toggleSubject}
                  searching={searching}
                  lastStudied={lastStudied}
                />
              )}
            </div>

            <Leaderboard data={leaderboard} />
          </div>
        </div>
      </main>
    </div>
  );
}
