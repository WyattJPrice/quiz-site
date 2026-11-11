import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { getProgressForSlug, saveProgressForSlug } from '@/db/stats';
import { isSameOrigin } from '@/lib/auth-helpers';
import type { LearnSessionState } from '@/lib/learn-types';

export const dynamic = 'force-dynamic';

function numberArray(value: unknown, length?: number): number[] | null {
  if (!Array.isArray(value)) return null;
  const numbers = value.map((item) => Number(item));
  if (numbers.some((item) => !Number.isInteger(item) || item < 0)) return null;
  if (typeof length === 'number' && numbers.length !== length) return null;
  return numbers;
}

function cleanState(value: unknown): LearnSessionState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Record<string, unknown>;

  const remaining = numberArray(state.remaining);
  const wrongPile = numberArray(state.wrongPile);
  const currentIdx = Number(state.currentIdx);
  const round = Number(state.round);
  const totalCorrect = Number(state.totalCorrect);
  const totalWrong = Number(state.totalWrong);

  if (!remaining || !wrongPile) return null;
  if (![currentIdx, round, totalCorrect, totalWrong].every(Number.isInteger)) return null;
  if (currentIdx < 0 || round < 0 || totalCorrect < 0 || totalWrong < 0) return null;

  return {
    slug: '',
    remaining: remaining.slice(0, 5000),
    wrongPile: wrongPile.slice(0, 5000),
    currentIdx,
    round,
    totalCorrect,
    totalWrong,
    updatedAt: Date.now(),
  };
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!db) return NextResponse.json({ state: null, updatedAt: null });

  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const saved = await getProgressForSlug(userId, slug);
  if (!saved) return NextResponse.json({ state: null, updatedAt: null });

  return NextResponse.json({
    state: saved.state,
    updatedAt: saved.updatedAt.toISOString(),
  });
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
  const slug = typeof body?.slug === 'string' ? body.slug : '';
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const state = cleanState(body?.state);
  if (!state) return NextResponse.json({ error: 'Invalid progress state.' }, { status: 400 });

  const saved = await saveProgressForSlug(userId, slug, { ...state, slug });
  if (!saved) return NextResponse.json({ error: 'Unknown study set.' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
