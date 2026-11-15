import { getDb } from '@/lib/db';

export interface IncomingQuestion {
  type: 'fill_blank' | 'multiple_choice';
  category: string;
  prompt: string;
  answer: string;
  choices?: string[];
}

export interface ValidatedQuestion {
  question_type: 'fill_blank' | 'multiple_choice';
  category: string;
  prompt: string;
  answer: string;
  choices: string[] | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function validateQuestions(
  raw: unknown
): { questions: ValidatedQuestion[] } | { error: string } {
  if (!Array.isArray(raw)) return { error: 'questions must be an array' };
  const out: ValidatedQuestion[] = [];
  for (const item of raw) {
    const q = item as Partial<IncomingQuestion>;
    if (!q || typeof q.prompt !== 'string' || !q.prompt.trim()) {
      return { error: 'Each question needs a prompt' };
    }
    if (typeof q.answer !== 'string' || !q.answer.trim()) {
      return { error: `Question "${q.prompt.slice(0, 40)}" needs an answer` };
    }
    const type = q.type === 'multiple_choice' ? 'multiple_choice' : 'fill_blank';
    const category =
      typeof q.category === 'string' && q.category.trim()
        ? q.category.trim().slice(0, 80)
        : 'General';
    let choices: string[] | null = null;
    if (type === 'multiple_choice') {
      if (!Array.isArray(q.choices) || q.choices.length < 2) {
        return { error: `Multiple-choice question "${q.prompt.slice(0, 40)}" needs at least 2 choices` };
      }
      choices = q.choices
        .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
        .map((c) => c.trim());
      if (choices.length < 2) {
        return { error: `Multiple-choice question "${q.prompt.slice(0, 40)}" needs at least 2 choices` };
      }
      const answer = q.answer.trim();
      if (!choices.includes(answer)) {
        return { error: `Answer must match one of the choices: "${q.prompt.slice(0, 40)}"` };
      }
    }
    out.push({
      question_type: type,
      category,
      prompt: q.prompt.trim(),
      answer: q.answer.trim(),
      choices,
    });
  }
  if (out.length === 0) return { error: 'A set needs at least one question' };
  return { questions: out };
}

function parseTestAt(value: unknown): string | null | 'invalid' {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'invalid';
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 'invalid';
  return value;
}

async function uniqueSlug(db: Awaited<ReturnType<typeof getDb>>, base: string): Promise<string> {
  const root = base || 'set';
  let candidate = root;
  let n = 2;
  for (;;) {
    const { rows } = await db.query('SELECT 1 FROM study_sets WHERE slug = $1', [candidate]);
    if (rows.length === 0) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export async function saveStudySet(
  db: Awaited<ReturnType<typeof getDb>>,
  input: {
    title: string;
    description?: string;
    subjectSlug?: string;
    newSubject?: string;
    testAt: string | null;
    questions: ValidatedQuestion[];
    setId?: string;
  }
): Promise<{ slug: string; setId: string } | { error: string }> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    let subjectId: string | null = null;
    if (input.newSubject) {
      const name = input.newSubject.trim().slice(0, 80);
      if (!name) return { error: 'Subject name cannot be empty' };
      const subjectSlug = slugify(name);
      const existing = await client.query('SELECT id FROM subjects WHERE slug = $1 OR lower(name) = lower($2)', [
        subjectSlug,
        name,
      ]);
      if (existing.rows.length > 0) {
        subjectId = existing.rows[0].id as string;
      } else {
        const max = await client.query('SELECT coalesce(max(sort_order), 0) + 1 AS next FROM subjects');
        const inserted = await client.query<{ id: string }>(
          'INSERT INTO subjects (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING id',
          [name, subjectSlug, max.rows[0].next]
        );
        subjectId = inserted.rows[0].id;
      }
    } else if (input.subjectSlug) {
      const found = await client.query('SELECT id FROM subjects WHERE slug = $1', [input.subjectSlug]);
      if (found.rows.length === 0) return { error: 'Unknown subject' };
      subjectId = found.rows[0].id as string;
    } else {
      return { error: 'Subject is required' };
    }

    if (input.setId) {
      const current = await client.query('SELECT subject_id FROM study_sets WHERE id = $1', [input.setId]);
      if (current.rows.length === 0) return { error: 'Set not found' };
      await client.query('DELETE FROM questions WHERE study_set_id = $1', [input.setId]);
      await client.query(
        'UPDATE study_sets SET subject_id = $2, title = $3, description = $4, test_at = $5, updated_at = now() WHERE id = $1',
        [input.setId, subjectId, input.title.trim(), input.description ?? null, input.testAt]
      );
      const setId = input.setId;
      await insertQuestions(client, setId, input.questions);
      await client.query('COMMIT');
      return { slug: (await db.query<{ slug: string }>('SELECT slug FROM study_sets WHERE id = $1', [setId])).rows[0].slug, setId };
    }

    const slug = await uniqueSlug(db, slugify(input.title));
    if (!slug) return { error: 'Title is required' };

    const set = await client.query<{ id: string }>(
      'INSERT INTO study_sets (subject_id, slug, title, description, test_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [subjectId, slug, input.title.trim(), input.description ?? null, input.testAt]
    );
    const setId = set.rows[0].id;
    await insertQuestions(client, setId, input.questions);
    await client.query('COMMIT');
    return { slug, setId };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('saveStudySet failed', err);
    return { error: 'Failed to save set' };
  } finally {
    client.release();
  }
}

async function insertQuestions(
  client: { query: (sql: string, params?: unknown[]) => Promise<unknown> },
  setId: string,
  questions: ValidatedQuestion[]
) {
  let i = 0;
  for (const q of questions) {
    await client.query(
      `INSERT INTO questions (study_set_id, sort_order, category, prompt, answer, question_type, choices)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        setId,
        i++,
        q.category,
        q.prompt,
        q.answer,
        q.question_type,
        q.choices ? JSON.stringify(q.choices) : null,
      ]
    );
  }
}

export { slugify, parseTestAt };
