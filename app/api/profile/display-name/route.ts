import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { isSameOrigin } from '@/lib/auth-helpers';
import { containsProfanity } from '@/lib/profanity';

export const dynamic = 'force-dynamic';

/**
 * Same contract as classlink's POST /api/profile/display-name:
 * 401 signed out, 400 empty or over 30 characters, 422 profanity.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!db) return NextResponse.json({ error: 'Accounts are not configured.' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const raw = typeof body?.name === 'string' ? body.name : '';
  const name = raw.trim();

  if (!name) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
  if (name.length > 30) {
    return NextResponse.json({ error: 'Name is too long (max 30 characters).' }, { status: 400 });
  }
  if (containsProfanity(name)) {
    return NextResponse.json({ error: 'Inappropriate language detected' }, { status: 422 });
  }

  try {
    await db.update(users).set({ displayName: name }).where(eq(users.id, userId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the name.';
    const taken = /users_display_name_lower_key|duplicate key/i.test(message);
    return NextResponse.json(
      { error: taken ? 'That name is already taken.' : message },
      { status: taken ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true, name });
}
