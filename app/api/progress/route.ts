import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ProgressBody {
  slug?: string;
  kind?: string;
  answered?: number;
  bestScore?: number;
  knownIndices?: number[];
}

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

  const { slug, kind, answered, bestScore, knownIndices } = body;
  const answeredCount = Math.max(0, Math.floor(Number(answered) || 0));
  if (!slug && answeredCount === 0) {
    return Response.json({ error: 'nothing to record' }, { status: 400 });
  }
  if (slug) {
    if (typeof slug !== 'string' || !slug) {
      return Response.json({ error: 'slug is required' }, { status: 400 });
    }
    if (kind !== 'quiz' && kind !== 'learn') {
      return Response.json({ error: 'kind must be quiz or learn' }, { status: 400 });
    }
  }
  const best = typeof bestScore === 'number' ? Math.floor(bestScore) : null;
  const known =
    Array.isArray(knownIndices) && kind === 'learn'
      ? knownIndices.map(Number).filter((n) => Number.isInteger(n) && n >= 0)
      : [];

  const db = getDb();
  const client = await db.connect();
  try {
    let setId: string | undefined;
    if (slug) {
      const sets = await client.query<{ id: string }>(
        'SELECT id FROM study_sets WHERE slug = $1',
        [slug]
      );
      setId = sets.rows[0]?.id;
      if (!setId) {
        return Response.json({ error: 'Unknown quiz' }, { status: 404 });
      }
    }

    await client.query('BEGIN');
    await client.query(
      `INSERT INTO user_stats (user_id, questions_answered)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
         SET questions_answered = user_stats.questions_answered + EXCLUDED.questions_answered,
             updated_at = now()`,
      [session.user.id, answeredCount]
    );

    if (setId && best !== null) {
      await client.query(
        `INSERT INTO best_scores (user_id, study_set_id, best_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, study_set_id) DO UPDATE
           SET best_score = GREATEST(best_scores.best_score, EXCLUDED.best_score),
               updated_at = now()`,
        [session.user.id, setId, best]
      );
    }

    if (setId && known.length > 0) {
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
