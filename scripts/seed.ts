import { neon } from '@neondatabase/serverless';
import { and, eq, gte, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { quizzes } from '../data';
import * as schema from '../db/schema';
import { questions, studySets, subjects } from '../db/schema';
import { deterministicUuid } from '../lib/deterministic-uuid';
import {
  LEGACY_SUBJECTS,
  SET_ICON_KEYS,
  legacyCreatedAtMap,
  subjectMetaFor,
} from '../lib/legacy';

const CHUNK_SIZE = 150;

interface ImportResult {
  imported: number;
  skipped: number;
  failed: string[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Add it to .env before seeding.');
    process.exitCode = 1;
    return;
  }

  const db = drizzle(neon(url), { schema });
  const createdAtMap = legacyCreatedAtMap();
  const result: ImportResult = { imported: 0, skipped: 0, failed: [] };
  const subjectIds = new Map<string, string>();

  // 1. Subjects, in dependency order before sets and questions.
  for (const subject of LEGACY_SUBJECTS) {
    const [row] = await db
      .insert(subjects)
      .values({
        id: deterministicUuid('subject', subject.slug),
        name: subject.name,
        slug: subject.slug,
        iconKey: subject.iconKey,
        sortOrder: subject.sortOrder,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subjects.slug,
        set: {
          name: subject.name,
          iconKey: subject.iconKey,
          sortOrder: subject.sortOrder,
        },
      })
      .returning({ id: subjects.id });

    subjectIds.set(subject.name, row.id);
  }

  // 2. Study sets. On re-run, keep the original created_at (so ordering never
  // changes) and never overwrite a test date that was set after the migration.
  for (const [index, quiz] of quizzes.entries()) {
    const sectionName = quiz.section;
    if (!sectionName) {
      result.skipped += 1;
      console.warn(`Skipped "${quiz.slug}": missing subject section.`);
      continue;
    }
    if (!quiz.slug.trim() || !quiz.title.trim()) {
      result.skipped += 1;
      console.warn(`Skipped "${quiz.slug || '(no slug)'}": missing title or slug.`);
      continue;
    }
    if (quiz.questions.length === 0) {
      result.skipped += 1;
      console.warn(`Skipped "${quiz.slug}": no questions.`);
      continue;
    }

    const invalidQuestion = quiz.questions.find(
      (question) => !question.question.trim() || !question.answer.trim(),
    );
    if (invalidQuestion) {
      result.failed.push(`${quiz.slug}: question with empty prompt or answer`);
      continue;
    }

    const meta = subjectMetaFor(sectionName, index);
    const subjectId =
      subjectIds.get(sectionName) ??
      (
        await db
          .insert(subjects)
          .values({
            id: deterministicUuid('subject', meta.slug),
            name: meta.name,
            slug: meta.slug,
            iconKey: meta.iconKey,
            sortOrder: meta.sortOrder,
          })
          .onConflictDoUpdate({
            target: subjects.slug,
            set: { name: meta.name, iconKey: meta.iconKey, sortOrder: meta.sortOrder },
          })
          .returning({ id: subjects.id })
      )[0].id;
    subjectIds.set(sectionName, subjectId);

    const createdAt = new Date(createdAtMap[quiz.slug] ?? Date.now());
    const now = new Date();

    const [setRow] = await db
      .insert(studySets)
      .values({
        id: deterministicUuid('set', quiz.slug),
        subjectId,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description || null,
        iconKey: SET_ICON_KEYS[quiz.slug] ?? 'book-open',
        testAt: null,
        testCompletedAt: null,
        createdAt,
        updatedAt: createdAt,
      })
      .onConflictDoUpdate({
        target: studySets.slug,
        set: {
          subjectId,
          title: quiz.title,
          description: quiz.description || null,
          iconKey: SET_ICON_KEYS[quiz.slug] ?? 'book-open',
          updatedAt: now,
        },
      })
      .returning({ id: studySets.id });

    // 3. Questions, preserving order and the full existing answer format.
    const questionRows = quiz.questions.map((question, questionIndex) => ({
      id: deterministicUuid('question', quiz.slug, String(questionIndex)),
      studySetId: setRow.id,
      prompt: question.question,
      answer: question.answer,
      questionType: question.choices ? 'multiple_choice' : 'fill_blank',
      category: question.cat,
      choices: question.choices ?? null,
      sortOrder: questionIndex,
      createdAt,
      updatedAt: createdAt,
    }));

    for (const batch of chunk(questionRows, CHUNK_SIZE)) {
      await db
        .insert(questions)
        .values(batch)
        .onConflictDoUpdate({
          target: questions.id,
          set: {
            studySetId: sql`excluded.study_set_id`,
            prompt: sql`excluded.prompt`,
            answer: sql`excluded.answer`,
            questionType: sql`excluded.question_type`,
            category: sql`excluded.category`,
            choices: sql`excluded.choices`,
            sortOrder: sql`excluded.sort_order`,
            updatedAt: now,
          },
        });
    }

    // Drop questions that no longer exist in the source file.
    await db
      .delete(questions)
      .where(
        and(
          eq(questions.studySetId, setRow.id),
          gte(questions.sortOrder, questionRows.length),
        ),
      );

    result.imported += 1;
    console.log(`Imported ${quiz.slug} (${questionRows.length} questions)`);
  }

  // 4. Verify destination counts against the source.
  const [{ setCount }] = await db
    .select({ setCount: sql<number>`count(*)::int` })
    .from(studySets);
  const [{ questionCount }] = await db
    .select({ questionCount: sql<number>`count(*)::int` })
    .from(questions);
  const [{ subjectCount }] = await db
    .select({ subjectCount: sql<number>`count(*)::int` })
    .from(subjects);
  const [{ scheduledTests }] = await db
    .select({ scheduledTests: sql<number>`count(*)::int` })
    .from(studySets)
    .where(sql`${studySets.testAt} is not null`);

  const sourceQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);

  console.log('');
  console.log('Import summary');
  console.log(`  Sets:      ${result.imported} imported, ${result.skipped} skipped`);
  console.log(`  Questions: ${questionCount} in database (source: ${sourceQuestions})`);
  console.log(`  Subjects:  ${subjectCount}`);
  console.log(`  Scheduled test dates: ${scheduledTests} (none added by this import)`);
  if (result.failed.length > 0) {
    console.log('  Failures:');
    for (const failure of result.failed) console.log(`    - ${failure}`);
  }

  const countsMatch =
    result.imported + result.skipped === quizzes.length &&
    setCount === quizzes.length &&
    questionCount === sourceQuestions;

  if (!countsMatch || result.failed.length > 0) {
    console.error('Import verification failed: source and destination counts differ.');
    process.exitCode = 1;
  } else {
    console.log('Import verified: source and destination counts match.');
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
