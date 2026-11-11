import { cache } from 'react';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { LearnSessionState } from '@/lib/learn-types';
import { db } from './index';
import { quizProgress, quizResults, studySets, subjects, users } from './schema';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  correct: number;
  rank: number;
  isMe: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  players: number;
}

/**
 * Ranks every account by total correct answers across finished sets (learn and
 * test, repeat practice included). There is no seeded player: an empty database
 * produces an empty board.
 */
export const getLeaderboard = cache(async (viewerId?: string): Promise<LeaderboardData> => {
  if (!db) return { entries: [], me: null, players: 0 };

  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      name: users.name,
      image: users.image,
      correct: sql<number>`coalesce(sum(${quizResults.correct}), 0)::int`,
    })
    .from(users)
    .leftJoin(quizResults, eq(quizResults.userId, users.id))
    .groupBy(users.id, users.displayName, users.name, users.image);

  const ranked = rows
    .map((row) => ({
      userId: row.userId,
      name: row.displayName?.trim() || row.name?.trim() || 'Student',
      image: row.image,
      correct: Number(row.correct) || 0,
    }))
    .sort((a, b) => b.correct - a.correct || a.userId.localeCompare(b.userId))
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      isMe: Boolean(viewerId) && row.userId === viewerId,
    }));

  return {
    entries: ranked.slice(0, 10),
    me: viewerId ? ranked.find((row) => row.userId === viewerId) ?? null : null,
    players: ranked.length,
  };
});

export interface SubjectStat {
  name: string;
  answered: number;
  correct: number;
}

export interface RecentResult {
  slug: string;
  title: string;
  mode: string;
  answered: number;
  correct: number;
  at: string;
}

export interface UserStats {
  answered: number;
  correct: number;
  setsFinished: number;
  accuracy: number;
  subjects: SubjectStat[];
  recent: RecentResult[];
  daily: { day: string; answered: number; correct: number }[];
}

function lastSevenDays(): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - offset);
    days.push(day.toISOString().slice(0, 10));
  }

  return days;
}

export const getUserStats = cache(async (userId: string): Promise<UserStats> => {
  if (!db) {
    return { answered: 0, correct: 0, setsFinished: 0, accuracy: 0, subjects: [], recent: [], daily: [] };
  }

  const [totals] = await db
    .select({
      answered: sql<number>`coalesce(sum(${quizResults.answered}), 0)::int`,
      correct: sql<number>`coalesce(sum(${quizResults.correct}), 0)::int`,
      setsFinished: sql<number>`count(*)::int`,
    })
    .from(quizResults)
    .where(eq(quizResults.userId, userId));

  const subjectRows = await db
    .select({
      name: subjects.name,
      answered: sql<number>`coalesce(sum(${quizResults.answered}), 0)::int`,
      correct: sql<number>`coalesce(sum(${quizResults.correct}), 0)::int`,
    })
    .from(quizResults)
    .innerJoin(studySets, eq(studySets.id, quizResults.studySetId))
    .innerJoin(subjects, eq(subjects.id, studySets.subjectId))
    .where(eq(quizResults.userId, userId))
    .groupBy(subjects.name, subjects.sortOrder)
    .orderBy(asc(subjects.sortOrder), asc(subjects.name));

  const recentRows = await db
    .select({
      slug: studySets.slug,
      title: studySets.title,
      mode: quizResults.mode,
      answered: quizResults.answered,
      correct: quizResults.correct,
      at: quizResults.createdAt,
    })
    .from(quizResults)
    .innerJoin(studySets, eq(studySets.id, quizResults.studySetId))
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.createdAt))
    .limit(10);

  const dailyRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${quizResults.createdAt}), 'YYYY-MM-DD')`,
      answered: sql<number>`coalesce(sum(${quizResults.answered}), 0)::int`,
      correct: sql<number>`coalesce(sum(${quizResults.correct}), 0)::int`,
    })
    .from(quizResults)
    .where(
      and(
        eq(quizResults.userId, userId),
        sql`${quizResults.createdAt} >= now() - interval '7 days'`,
      ),
    )
    .groupBy(sql`date_trunc('day', ${quizResults.createdAt})`)
    .orderBy(sql`date_trunc('day', ${quizResults.createdAt})`);

  const dailyByDay = new Map(dailyRows.map((row) => [row.day, row]));
  const daily = lastSevenDays().map((day) => {
    const row = dailyByDay.get(day);
    return {
      day,
      answered: Number(row?.answered) || 0,
      correct: Number(row?.correct) || 0,
    };
  });

  const answered = Number(totals?.answered) || 0;
  const correct = Number(totals?.correct) || 0;

  return {
    answered,
    correct,
    setsFinished: Number(totals?.setsFinished) || 0,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    subjects: subjectRows.map((row) => ({
      name: row.name,
      answered: Number(row.answered) || 0,
      correct: Number(row.correct) || 0,
    })),
    recent: recentRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      mode: row.mode,
      answered: row.answered,
      correct: row.correct,
      at: row.at.toISOString(),
    })),
    daily,
  };
});

/** Newest activity per set, so the library can show where to pick up. */
export const getLastStudied = cache(async (viewerId?: string): Promise<Record<string, string>> => {
  if (!db || !viewerId) return {};

  const progressRows = await db
    .select({ slug: studySets.slug, at: quizProgress.updatedAt })
    .from(quizProgress)
    .innerJoin(studySets, eq(studySets.id, quizProgress.studySetId))
    .where(eq(quizProgress.userId, viewerId));

  const resultRows = await db
    .select({ slug: studySets.slug, at: sql<Date>`max(${quizResults.createdAt})` })
    .from(quizResults)
    .innerJoin(studySets, eq(studySets.id, quizResults.studySetId))
    .where(eq(quizResults.userId, viewerId))
    .groupBy(studySets.slug);

  const latest: Record<string, number> = {};
  for (const row of [...progressRows, ...resultRows]) {
    const time = row.at instanceof Date ? row.at.getTime() : new Date(row.at).getTime();
    if (Number.isNaN(time)) continue;
    if (!latest[row.slug] || latest[row.slug] < time) latest[row.slug] = time;
  }

  return Object.fromEntries(
    Object.entries(latest).map(([slug, time]) => [slug, new Date(time).toISOString()]),
  );
});

export async function getProgressForSlug(
  userId: string,
  slug: string,
): Promise<{ state: LearnSessionState; updatedAt: Date } | null> {
  if (!db) return null;

  const [row] = await db
    .select({ state: quizProgress.state, updatedAt: quizProgress.updatedAt })
    .from(quizProgress)
    .innerJoin(studySets, eq(studySets.id, quizProgress.studySetId))
    .where(and(eq(quizProgress.userId, userId), eq(studySets.slug, slug)))
    .limit(1);

  return row ?? null;
}

export async function saveProgressForSlug(
  userId: string,
  slug: string,
  state: LearnSessionState,
): Promise<boolean> {
  if (!db) return false;

  const [set] = await db
    .select({ id: studySets.id })
    .from(studySets)
    .where(eq(studySets.slug, slug))
    .limit(1);

  if (!set) return false;

  await db
    .insert(quizProgress)
    .values({ userId, studySetId: set.id, state, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [quizProgress.userId, quizProgress.studySetId],
      set: { state, updatedAt: new Date() },
    });

  return true;
}

export async function insertFinishedSet(input: {
  userId: string;
  slug: string;
  mode: 'learn' | 'test';
  answered: number;
  correct: number;
}): Promise<boolean> {
  if (!db) return false;

  const [set] = await db
    .select({ id: studySets.id })
    .from(studySets)
    .where(eq(studySets.slug, input.slug))
    .limit(1);

  if (!set) return false;

  await db.insert(quizResults).values({
    userId: input.userId,
    studySetId: set.id,
    mode: input.mode,
    answered: input.answered,
    correct: input.correct,
  });

  return true;
}
