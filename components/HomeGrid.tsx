'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getKnownIndices } from '@/lib/learn-storage';
import { isOffline } from '@/lib/offline-status';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface QuizItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  section: string;
  count: number;
  testDate?: string;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function formatTestDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeGrid({
  items,
  isAdmin = false,
}: {
  items: QuizItem[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [learnPct, setLearnPct] = useState<Record<string, number>>({});
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  // Starts empty (SSR/mount render) and fills after mount — client-side date
  // check keeps the upcoming/passed classification hydration-safe
  const [upcoming, setUpcoming] = useState<QuizItem[]>([]);

  // Read local learn progress + compute upcoming tests after mount
  useEffect(() => {
    const t = todayStr();
    setUpcoming(
      items
        .filter((q) => q.testDate && q.testDate >= t)
        .sort((a, b) => (a.testDate! < b.testDate! ? -1 : 1))
    );
    try {
      const nextLearnPct: Record<string, number> = {};
      for (const it of items) {
        const known = getKnownIndices(it.slug).length;
        if (known > 0) {
          nextLearnPct[it.slug] = Math.round((known / it.count) * 100);
        }
      }
      setLearnPct(nextLearnPct);
    } catch {
      // ignore
    }
  }, [items]);

  const matchesQuery = (q: QuizItem) => {
    if (!query) return true;
    const s = query.toLowerCase();
    return (
      q.title.toLowerCase().includes(s) ||
      q.description.toLowerCase().includes(s) ||
      q.section.toLowerCase().includes(s)
    );
  };

  const upcomingIds = new Set(upcoming.map((q) => q.slug));
  const visibleUpcoming = upcoming.filter(matchesQuery);

  const sections = new Map<string, QuizItem[]>();
  for (const q of items.filter((q) => !upcomingIds.has(q.slug) && matchesQuery(q))) {
    if (!sections.has(q.section)) sections.set(q.section, []);
    sections.get(q.section)!.push(q);
  }

  const totalCount = items.reduce((a, q) => a + q.count, 0);

  async function handleDelete(q: QuizItem) {
    if (!window.confirm(`Delete "${q.title}" and its ${q.count} questions? This cannot be undone.`)) return;
    setDeletingIds((prev) => new Set(prev).add(q.id));
    try {
      const res = await fetch(`/api/admin/sets/${q.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? 'Could not delete the set.');
        return;
      }
      toast.success(`Deleted "${q.title}".`);
      router.refresh();
    } catch {
      toast.error('Could not delete the set.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(q.id);
        return next;
      });
    }
  }

  function renderCard(q: QuizItem, testLabel?: string) {
    return (
      <div
        key={q.slug}
        onClick={() => router.push(`/learn/${q.slug}`)}
        className={`relative flex cursor-pointer flex-col bg-card p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-md ${
          testLabel
            ? 'border border-primary/40 hover:border-primary'
            : 'border border-border hover:border-muted-foreground/50'
        }`}
      >
        {isAdmin && (
          <span
            className="absolute top-3 right-3 z-10 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => router.push(`/create?id=${q.id}`)}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={`Edit ${q.title}`}
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => handleDelete(q)}
              disabled={deletingIds.has(q.id)}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              aria-label={`Delete ${q.title}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </span>
        )}
        <div className={`text-[15px] leading-snug font-semibold break-words ${isAdmin ? 'pr-14' : ''}`}>{q.title}</div>
        {testLabel && (
          <div className="mt-1 text-xs font-semibold text-primary">
            Test · {testLabel}
          </div>
        )}
        <div className="mt-3.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {q.count} questions
            {learnPct[q.slug] !== undefined && (
              <>
                {' · '}
                <span className="font-semibold text-correct">
                  {learnPct[q.slug]}% learned
                </span>
              </>
            )}
          </span>
          <span
            className="-mx-1 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              className="h-7 px-2.5 text-xs"
              render={<Link href={`/quiz/${q.slug}`} />}
            >
              Test
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              className="h-7 px-2.5 text-xs"
              render={<Link href={`/learn/${q.slug}`} />}
            >
              Learn
            </Button>
          </span>
        </div>
      </div>
    );
  }

  function renderSection(
    label: string,
    list: QuizItem[],
    highlight: boolean,
    itemsWithDates?: QuizItem[]
  ) {
    return (
      <div key={label} className="mb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <span
            className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${
              highlight ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {label}
          </span>
          <span
            className={`text-[11px] tabular-nums ${
              highlight ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {list.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((q) =>
            renderCard(
              q,
              itemsWithDates?.find((x) => x.slug === q.slug)?.testDate &&
                formatTestDate(
                  itemsWithDates!.find((x) => x.slug === q.slug)!.testDate!
                )
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-10 pb-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} questions across {items.length} sets
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              // Hidden offline launcher: exact code, and only while offline.
              if (value === '0000') {
                void isOffline().then((offline) => {
                  if (!offline) return;
                  setQuery('');
                  window.dispatchEvent(new Event('study:games'));
                });
              }
            }}
            placeholder="Search quizzes…"
            className="h-9 pl-9 text-sm"
            aria-label="Search quizzes"
          />
        </div>
      </div>

      {visibleUpcoming.length === 0 &&
        [...sections.values()].flat().length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No quizzes match “{query}”.
          </p>
        )}

      {visibleUpcoming.length > 0 &&
        renderSection('Upcoming Tests', visibleUpcoming, true, visibleUpcoming)}

      {[...sections.entries()].map(([section, list]) =>
        renderSection(section, list, false)
      )}
    </div>
  );
}
