'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ChevronDown,
  Clock,
  Library,
  Search,
  TrendingUp,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import StudySetIcon from './StudySetIcon';
import type { LibraryData, StudySetSummary, SubjectSummary } from '@/lib/library-types';

type View = 'library' | 'recent' | 'progress';

const NAV: { id: View; label: string; icon: typeof Library }[] = [
  { id: 'library', label: 'Library', icon: Library },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Only upcoming, incomplete tests show a date. Completed tests and sets with no
 * scheduled test show nothing at all. A past date is never treated as complete.
 */
function upcomingTestLabel(set: StudySetSummary): string | null {
  if (!set.testAt || set.testCompletedAt) return null;

  const todayIso = new Date().toISOString().slice(0, 10);
  if (set.testAt < todayIso) return null;

  const [year, month, day] = set.testAt.split('-').map(Number);
  if (!year || !month || !day) return null;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function StudySetCard({ set }: { set: StudySetSummary }) {
  const testLabel = upcomingTestLabel(set);

  return (
    <article className="set-card">
      <div className="set-card-head">
        <span className="set-icon">
          <StudySetIcon iconKey={set.iconKey} size={17} />
        </span>
        <h3 className="set-title">
          <Link href={`/learn/${set.slug}`}>{set.title}</Link>
        </h3>
      </div>

      <p className="set-meta">{plural(set.questionCount, 'question')}</p>

      {set.description ? <p className="set-desc">{set.description}</p> : null}

      {testLabel ? (
        <p className="set-test">
          <span className="set-test-dot" aria-hidden="true" />
          Test: {testLabel}
        </p>
      ) : null}

      <div className="set-actions">
        <Link className="btn-study" href={`/learn/${set.slug}`}>
          Study
        </Link>
        <Link className="btn-test" href={`/quiz/${set.slug}`}>
          Take Test
        </Link>
      </div>
    </article>
  );
}

function SetGrid({ sets }: { sets: StudySetSummary[] }) {
  return (
    <div className="set-grid">
      {sets.map((set) => (
        <StudySetCard key={set.id} set={set} />
      ))}
    </div>
  );
}

function EmptyState({ onReset, query }: { onReset: () => void; query: string }) {
  return (
    <div className="empty-state">
      <p className="empty-title">No study sets found</p>
      <p className="empty-copy">
        {query
          ? `Nothing matches “${query.trim()}” with the current filters.`
          : 'Nothing matches the current filters.'}
      </p>
      <button type="button" className="empty-reset" onClick={onReset}>
        Clear search and filters
      </button>
    </div>
  );
}

function SubjectSections({
  subjects,
  sets,
  collapsed,
  onToggle,
  searching,
}: {
  subjects: SubjectSummary[];
  sets: StudySetSummary[];
  collapsed: Set<string>;
  onToggle: (slug: string) => void;
  searching: boolean;
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
                <span className="subject-icon">
                  <StudySetIcon iconKey={subject.iconKey} size={16} />
                </span>
                <span className="subject-name">{subject.name}</span>
                <span className="subject-count">{plural(subjectSets.length, 'set')}</span>
                <ChevronDown
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className={`subject-chevron${isCollapsed ? ' is-collapsed' : ''}`}
                />
              </button>
            </h2>

            {!isCollapsed ? (
              <div id={panelId}>
                <SetGrid sets={subjectSets} />
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}

function ProgressView({ subjects }: { subjects: SubjectSummary[] }) {
  const maxQuestions = Math.max(...subjects.map((subject) => subject.questionCount), 1);

  return (
    <section className="progress-panel" aria-labelledby="progress-heading">
      <div className="view-head">
        <h2 id="progress-heading" className="view-title">
          Progress
        </h2>
        <p className="view-copy">Question counts across your library.</p>
      </div>

      <div className="progress-list">
        {subjects.map((subject) => {
          const width = Math.round((subject.questionCount / maxQuestions) * 100);
          return (
            <div className="progress-row" key={subject.id}>
              <div className="progress-row-head">
                <span className="progress-name">
                  <StudySetIcon iconKey={subject.iconKey} size={15} />
                  {subject.name}
                </span>
                <span className="progress-meta">
                  {plural(subject.setCount, 'set')} · {plural(subject.questionCount, 'question')}
                </span>
              </div>
              <div
                className="progress-track"
                role="img"
                aria-label={`${subject.name}: ${plural(subject.questionCount, 'question')}`}
              >
                <div className="progress-fill" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="progress-note">
        These figures cover your whole library, not the current search or filter.
      </p>
    </section>
  );
}

export default function LibraryView({ library }: { library: LibraryData }) {
  const [view, setView] = useState<View>('library');
  const [query, setQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('all');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const needle = query.trim().toLowerCase();

  const filteredSets = useMemo(
    () =>
      library.sets.filter((set) => {
        if (activeSubject !== 'all' && set.subjectSlug !== activeSubject) return false;
        if (!needle) return true;
        const haystack = [
          set.title,
          set.subjectName,
          set.description ?? '',
          ...set.topics,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      }),
    [library.sets, activeSubject, needle],
  );

  const searching = needle.length > 0 || activeSubject !== 'all';

  function toggleSubject(slug: string) {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function resetFilters() {
    setQuery('');
    setActiveSubject('all');
  }

  const notice = library.databaseError
    ? 'The live database is unreachable right now, so this is the bundled study snapshot. Changes may not persist until the connection recovers.'
    : library.source === 'bundled'
      ? 'No database is configured, so this is the bundled study snapshot. Set DATABASE_URL to enable persistent storage.'
      : null;

  return (
    <div className="library-app">
      <aside className="library-sidebar">
        <Link href="/" className="brand" aria-label="Study Library home">
          <span className="brand-mark">
            <Library size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="brand-copy">
            <span className="brand-name">Wyatt Price</span>
            <span className="brand-label">Study</span>
          </span>
        </Link>

        <nav className="lib-nav" aria-label="Study library sections">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="lib-nav-item"
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => setView(item.id)}
              >
                <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <p className="sidebar-credit">
          Created by{' '}
          <a href="https://wyattprice.dev" target="_blank" rel="noreferrer">
            Wyatt Price
          </a>
        </p>
      </aside>

      <main className="library-main">
        <div className="library-main-inner">
          <header className="page-head">
            <div>
              <h1 className="page-title">Your study library</h1>
              <p className="page-subtitle">Pick up where you left off.</p>
            </div>
            <ThemeToggle inline />
          </header>

          {notice ? (
            <p className="db-notice" role="status">
              {notice}
            </p>
          ) : null}

          {view !== 'progress' ? (
            <>
              <div className="search-wrap">
                <Search className="search-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search subjects or topics..."
                  aria-label="Search subjects or topics"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="pill-row" role="group" aria-label="Filter by subject">
                <button
                  type="button"
                  className="pill"
                  aria-pressed={activeSubject === 'all'}
                  onClick={() => setActiveSubject('all')}
                >
                  All
                  <span className="pill-count">{library.stats.studySets}</span>
                </button>
                {library.subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    className="pill"
                    aria-pressed={activeSubject === subject.slug}
                    onClick={() => setActiveSubject(subject.slug)}
                  >
                    {subject.name}
                    <span className="pill-count">{subject.setCount}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="stat-row" aria-label="Library statistics">
            <div className="stat-cell">
              <span className="stat-value">{library.stats.studySets}</span>
              <span className="stat-label">Study sets</span>
            </div>
            <div className="stat-cell">
              <span className="stat-value">{library.stats.questions}</span>
              <span className="stat-label">Questions</span>
            </div>
            <div className="stat-cell">
              <span className="stat-value">{library.stats.subjects}</span>
              <span className="stat-label">Subjects</span>
            </div>
          </div>

          {view === 'library' ? (
            <>
              <p className="result-count" aria-live="polite">
                {searching
                  ? `Showing ${filteredSets.length} of ${library.stats.studySets} study sets`
                  : plural(library.stats.studySets, 'study set')}
              </p>

              {filteredSets.length === 0 ? (
                <EmptyState query={query} onReset={resetFilters} />
              ) : (
                <SubjectSections
                  subjects={library.subjects}
                  sets={filteredSets}
                  collapsed={collapsed}
                  onToggle={toggleSubject}
                  searching={searching}
                />
              )}
            </>
          ) : null}

          {view === 'recent' ? (
            <section aria-labelledby="recent-heading">
              <div className="view-head">
                <h2 id="recent-heading" className="view-title">
                  Recently added
                </h2>
                <p className="view-copy">Newest sets first, across every subject.</p>
              </div>
              {filteredSets.length === 0 ? (
                <EmptyState query={query} onReset={resetFilters} />
              ) : (
                <SetGrid sets={filteredSets} />
              )}
            </section>
          ) : null}

          {view === 'progress' ? <ProgressView subjects={library.subjects} /> : null}
        </div>
      </main>
    </div>
  );
}
