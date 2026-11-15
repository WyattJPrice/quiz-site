import { getDb } from '@/lib/db';
import type { Question } from '@/data/types';

export interface StudySetMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  section: string;
  count: number;
  /** Upcoming test date (yyyy-mm-dd) or null. */
  testDate: string | null;
}

export interface StudySetContent extends StudySetMeta {
  questions: Question[];
}

interface SetRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  section: string;
  test_date: string | null;
  count: string | number;
}

export async function getStudySets(): Promise<StudySetMeta[]> {
  const db = getDb();
  const { rows } = await db.query<SetRow>(
    `SELECT s.id, s.slug, s.title, s.description, sub.name AS section, s.test_at::text AS test_date,
            count(q.id)::int AS count
     FROM study_sets s
     JOIN subjects sub ON sub.id = s.subject_id
     LEFT JOIN questions q ON q.study_set_id = s.id
     GROUP BY s.id, sub.name, sub.sort_order
     ORDER BY sub.sort_order NULLS LAST, s.created_at, s.title`
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? '',
    section: r.section,
    count: Number(r.count),
    testDate: r.test_date,
  }));
}

export async function getStudySet(slug: string): Promise<StudySetContent | null> {
  const db = getDb();
  const { rows: sets } = await db.query<SetRow>(
    `SELECT s.id, s.slug, s.title, s.description, sub.name AS section, s.test_at::text AS test_date,
            count(q.id)::int AS count
     FROM study_sets s
     JOIN subjects sub ON sub.id = s.subject_id
     LEFT JOIN questions q ON q.study_set_id = s.id
     WHERE s.slug = $1
     GROUP BY s.id, sub.name
     LIMIT 1`,
    [slug]
  );
  if (sets.length === 0) return null;
  const r = sets[0];
  const { rows: qRows } = await db.query<{
    category: string;
    prompt: string;
    answer: string;
    question_type: string;
    choices: string[] | null;
  }>(
    `SELECT category, prompt, answer, question_type, choices
     FROM questions
     WHERE study_set_id = (SELECT id FROM study_sets WHERE slug = $1)
     ORDER BY sort_order`,
    [slug]
  );
  const questions: Question[] = qRows.map((q) => ({
    cat: q.category,
    question: q.prompt,
    answer: q.answer,
    ...(q.question_type === 'multiple_choice' && q.choices ? { choices: q.choices } : {}),
  }));
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? '',
    section: r.section,
    count: Number(r.count),
    testDate: r.test_date,
    questions,
  };
}

export async function getSubjects(): Promise<{ name: string; slug: string }[]> {
  const db = getDb();
  const { rows } = await db.query<{ name: string; slug: string }>(
    'SELECT name, slug FROM subjects ORDER BY sort_order'
  );
  return rows;
}
