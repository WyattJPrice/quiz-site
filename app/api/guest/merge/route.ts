import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { guestMerges, quizProgress, quizResults, studySets } from '@/db/schema';
import { isSameOrigin } from '@/lib/auth-helpers';
import type { LearnSessionState } from '@/lib/learn-types';

export const dynamic = 'force-dynamic';

interface ResultInput {
  slug: string;
  mode: 'learn' | 'test';
  answered: number;
  correct: number;
  at: string;
}

interface ProgressInput {
  slug: string;
  state: LearnSessionState;
  updatedAt: Date;
}

function parseResult(value: unknown): ResultInput | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;

  const slug = typeof row.slug === 'string' ? row.slug : '';
  const mode = row.mode === 'learn' || row.mode === 'test' ? row.mode : null;
  const answered = Number(row.answered);
  const correct = Number(row.correct);
  const at = typeof row.at === 'string' ? new Date(row.at) : new Date();

  if (!slug || !mode) return null;
  if (!Number.isInteger(answered) || !Number.isInteger(correct)) return null;
  if (answered < 0 || answered > 5000 || correct < 0 || correct > answered) return null;

  const timestamp = Number.isNaN(at.getTime()) ? new Date() : at;
  const oneDayAhead = Date.now() + 86_400_000;
  if (timestamp.getTime() > oneDayAhead) return null;

  return { slug, mode, answered, correct, at: timestamp.toISOString() };
}

function parseProgress(value: unknown): ProgressInput | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;

  const slug = typeof row.slug === 'string' ? row.slug : '';
  const state = row.state as Record<string, unknown> | undefined;
  if (!slug || !state || !Array.isArray(state.remaining) || !Array.isArray(state.wrongPile)) return null;

  const updatedAt = typeof row.updatedAt === 'string' ? new Date(row.updatedAt) : new Date();
  if (Number.isNaN(updatedAt.getTime())) return null;

  const remaining = state.remaining.map(Number).filter(Number.isInteger).slice(0, 5000);
  const wrongPile = state.wrongPile.map(Number).filter(Number.isInteger).slice(0, 5000);

  return {
    slug,
    updatedAt,
    state: {
      slug,
      remaining,
      wrongPile,
      currentIdx: Math.max(0, Number(state.currentIdx) || 0),
      round: Math.max(0, Number(state.round) || 0),
      totalCorrect: Math.max(0, Number(state.totalCorrect) || 0),
      totalWrong: Math.max(0, Number(state.totalWrong) || 0),
      updatedAt: updatedAt.getTime(),
    },
  };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!db) return NextResponse.json({ error: 'Accounts are not configured.' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const deviceId =
    typeof body?.deviceId === 'string' && body.deviceId.length > 0 && body.deviceId.length <= 120
      ? body.deviceId
      : null;
  if (!deviceId) return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });

  const results: ResultInput[] = (Array.isArray(body?.results) ? body.results : [])
    .slice(0, 200)
    .map(parseResult)
    .filter((row: ResultInput | null): row is ResultInput => row !== null);

  const progress: ProgressInput[] = (Array.isArray(body?.progress) ? body.progress : [])
    .slice(0, 100)
    .map(parseProgress)
    .filter((row: ProgressInput | null): row is ProgressInput => row !== null);

  const slugs = [...new Set([...results.map((row) => row.slug), ...progress.map((row) => row.slug)])];
  if (slugs.length === 0) return NextResponse.json({ merged: false, results: 0, progress: 0 });

  const setRows = await db
    .select({ id: studySets.id, slug: studySets.slug })
    .from(studySets)
    .where(inArray(studySets.slug, slugs));

  const idBySlug = new Map(setRows.map((row) => [row.slug, row.id]));

  // Claim the device first; the primary key makes a replay a no-op.
  const claim = await db
    .insert(guestMerges)
    .values({ userId, deviceId })
    .onConflictDoNothing({ target: [guestMerges.userId, guestMerges.deviceId] })
    .returning({ userId: guestMerges.userId });

  if (claim.length === 0) {
    return NextResponse.json({ merged: false, results: 0, progress: 0 });
  }

  try {
    const resultValues = results
      .map((row) => {
        const studySetId = idBySlug.get(row.slug);
        if (!studySetId) return null;
        return {
          userId,
          studySetId,
          mode: row.mode,
          answered: row.answered,
          correct: row.correct,
          createdAt: new Date(row.at),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (resultValues.length > 0) {
      await db.insert(quizResults).values(resultValues);
    }

    let progressCount = 0;
    for (const row of progress) {
      const studySetId = idBySlug.get(row.slug);
      if (!studySetId) continue;

      const [existing] = await db
        .select({ updatedAt: quizProgress.updatedAt })
        .from(quizProgress)
        .where(and(eq(quizProgress.userId, userId), eq(quizProgress.studySetId, studySetId)))
        .limit(1);

      if (existing && existing.updatedAt.getTime() >= row.updatedAt.getTime()) continue;

      await db
        .insert(quizProgress)
        .values({ userId, studySetId, state: row.state, updatedAt: row.updatedAt })
        .onConflictDoUpdate({
          target: [quizProgress.userId, quizProgress.studySetId],
          set: { state: row.state, updatedAt: row.updatedAt },
        });

      progressCount += 1;
    }

    return NextResponse.json({
      merged: true,
      results: resultValues.length,
      progress: progressCount,
    });
  } catch (error) {
    console.error('[guest/merge] failed, releasing the device claim', error);

    await db
      .delete(guestMerges)
      .where(and(eq(guestMerges.userId, userId), eq(guestMerges.deviceId, deviceId)))
      .catch(() => undefined);

    return NextResponse.json({ error: 'Could not merge guest progress.' }, { status: 500 });
  }
}
