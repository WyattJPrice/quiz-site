import { getAdminSession } from '@/lib/admin';
import { getDb } from '@/lib/db';
import { parseTestAt, saveStudySet, validateQuestions } from '@/lib/admin-sets';

export const dynamic = 'force-dynamic';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  const db = getDb();
  const { rows: sets } = await db.query<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    subject_slug: string;
    subject_name: string;
    test_at: string | null;
  }>(
    `SELECT s.id, s.slug, s.title, s.description, sub.slug AS subject_slug, sub.name AS subject_name,
            s.test_at::text AS test_at
     FROM study_sets s
     JOIN subjects sub ON sub.id = s.subject_id
     WHERE s.id = $1`,
    [id]
  );
  if (sets.length === 0) {
    return Response.json({ error: 'Set not found' }, { status: 404 });
  }
  const s = sets[0];
  const { rows: qRows } = await db.query<{
    question_type: string;
    category: string;
    prompt: string;
    answer: string;
    choices: string[] | null;
  }>(
    'SELECT question_type, category, prompt, answer, choices FROM questions WHERE study_set_id = $1 ORDER BY sort_order',
    [id]
  );

  return Response.json({
    set: {
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description ?? '',
      subjectSlug: s.subject_slug,
      subjectName: s.subject_name,
      testAt: s.test_at,
      questions: qRows.map((q) => ({
        type: q.question_type,
        category: q.category,
        prompt: q.prompt,
        answer: q.answer,
        ...(q.question_type === 'multiple_choice' && q.choices ? { choices: q.choices } : {}),
      })),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
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
    setId: id,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  const db = getDb();
  const { rowCount } = await db.query(
    'DELETE FROM questions WHERE study_set_id = $1',
    [id]
  );
  await db.query('DELETE FROM study_sets WHERE id = $1', [id]);
  return Response.json({ ok: true, removedQuestions: rowCount ?? 0 });
}
