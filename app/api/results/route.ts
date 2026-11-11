import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { insertFinishedSet } from '@/db/stats';
import { isSameOrigin } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

function count(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 5000) return null;
  return number;
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
  const mode = body?.mode === 'learn' || body?.mode === 'test' ? body.mode : null;
  const answered = count(body?.answered);
  const correct = count(body?.correct);

  if (!slug || !mode || answered === null || correct === null || correct > answered) {
    return NextResponse.json({ error: 'Invalid result.' }, { status: 400 });
  }

  const saved = await insertFinishedSet({ userId, slug, mode, answered, correct });
  if (!saved) return NextResponse.json({ error: 'Unknown study set.' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
