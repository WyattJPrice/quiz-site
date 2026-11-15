import { getAdminSession } from '@/lib/admin';
import { getDb } from '@/lib/db';
import { parseTestAt, saveStudySet, validateQuestions } from '@/lib/admin-sets';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  const db = getDb();
  const { rows } = await db.query<{
    id: string;
    slug: string;
    title: string;
    subject: string;
    test_at: string | null;
    count: number;
  }>(
    `SELECT s.id, s.slug, s.title, sub.name AS subject, s.test_at::text AS test_at,
            count(q.id)::int AS count
     FROM study_sets s
     JOIN subjects sub ON sub.id = s.subject_id
     LEFT JOIN questions q ON q.study_set_id = s.id
     GROUP BY s.id, sub.name
     ORDER BY s.created_at DESC`
  );
  return Response.json({ sets: rows });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  let body: {
    title?: string;
    description?: string;
    subjectSlug?: string;
    newSubject?: string;
    testAt?: string | null;
    questions?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  if (!title) return Response.json({ error: 'Set name is required' }, { status: 400 });

  const testAt = parseTestAt(body.testAt);
  if (testAt === 'invalid') {
    return Response.json({ error: 'Invalid test date' }, { status: 400 });
  }

  const validated = validateQuestions(body.questions);
  if ('error' in validated) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const db = getDb();
  const result = await saveStudySet(db, {
    title,
    description: (body.description ?? '').trim().slice(0, 300) || undefined,
    subjectSlug: body.subjectSlug,
    newSubject: body.newSubject,
    testAt,
    questions: validated.questions,
  });
  if ('error' in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true, slug: result.slug });
}
