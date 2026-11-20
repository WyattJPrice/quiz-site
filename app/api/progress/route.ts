import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ProgressBody {
  slug?: string;
  kind?: string;
  bestScore?: number;
  knownIndices?: number[];
}

/**
 * Records per-set study data for a signed-in student.
 *
 * Note: this endpoint deliberately stores no running total. Counters used to be
 * kept here for the class leaderboard, which has been removed.
 */
export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ProgressBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, kind, bestScore, knownIndices } = body;
  if (typeof slug !== 'string' || !slug) {
    return Response.json({ error: 'slug is required' }, { status: 400 });
  }
  if (kind !== 'quiz' && kind !== 'learn') {
    return Response.json({ error: 'kind must be quiz or learn' }, { status: 400 });
  }

  const best = typeof bestScore === 'number' ? Math.floor(bestScore) : null;
  const known =
    Array.isArray(knownIndices) && kind === 'learn'
      ? knownIndices.map(Number).filter((n) => Number.isInteger(n) && n >= 0)
      : [];

  const db = getDb();
  const client = await db.connect();
  try {
    const sets = await client.query<{ id: string }>(
      'SELECT id FROM study_sets WHERE slug = $1',
      [slug]
    );
    const setId = sets.rows[0]?.id;
    if (!setId) {
      return Response.json({ error: 'Unknown quiz' }, { status: 404 });
    }

    await client.query('BEGIN');

    if (best !== null) {
      await client.query(
        `INSERT INTO best_scores (user_id, study_set_id, best_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, study_set_id) DO UPDATE
           SET best_score = GREATEST(best_scores.best_score, EXCLUDED.best_score),
               updated_at = now()`,
        [session.user.id, setId, best]
      );
    }

    if (known.length > 0) {
      await client.query(
        `INSERT INTO known_questions (user_id, question_id)
         SELECT $1, q.id
         FROM questions q
         WHERE q.study_set_id = $2 AND q.sort_order = ANY($3::int[])
         ON CONFLICT (user_id, question_id) DO NOTHING`,
        [session.user.id, setId, known]
      );
    }
    await client.query('COMMIT');

    return Response.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('progress POST failed', err);
    return Response.json({ error: 'Failed to save progress' }, { status: 500 });
  } finally {
    client.release();
  }
}
