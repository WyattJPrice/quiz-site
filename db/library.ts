import { cache } from 'react';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { getQuiz } from '@/data';
import type { Question } from '@/data/types';
import { buildBundledLibrary } from '@/lib/legacy';
import type {
  LibraryData,
  LibraryStats,
  StudySetSummary,
  SubjectSummary,
} from '@/lib/library-types';
import { db, isDatabaseConfigured } from './index';
import { questions, studySets, subjects } from './schema';

/**
 * Full library snapshot. Sets are ordered by creation timestamp descending
 * (with id as a stable tie-breaker) both in SQL and after grouping, so newly
 * created sets always appear first within their subject.
 */
export const getLibrary = cache(async (): Promise<LibraryData> => {
  if (!db) return buildBundledLibrary();

  try {
    const setRows = await db
      .select({
        id: studySets.id,
        slug: studySets.slug,
        title: studySets.title,
        description: studySets.description,
        iconKey: studySets.iconKey,
        createdAt: studySets.createdAt,
        testAt: studySets.testAt,
        testCompletedAt: studySets.testCompletedAt,
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        subjectIconKey: subjects.iconKey,
        subjectSortOrder: subjects.sortOrder,
      })
      .from(studySets)
      .innerJoin(subjects, eq(studySets.subjectId, subjects.id))
      .orderBy(desc(studySets.createdAt), desc(studySets.id));

    const questionCountRows = await db
      .select({
        studySetId: questions.studySetId,
        questionCount: sql<number>`count(*)::int`,
      })
      .from(questions)
      .groupBy(questions.studySetId);

    const topicRows = await db
      .selectDistinct({
        studySetId: questions.studySetId,
        category: questions.category,
      })
      .from(questions)
      .orderBy(asc(questions.category));

    const subjectRows = await db
      .select()
      .from(subjects)
      .orderBy(asc(subjects.sortOrder), asc(subjects.name));

    const countBySet = new Map(
      questionCountRows.map((row) => [row.studySetId, row.questionCount]),
    );

    const topicsBySet = new Map<string, string[]>();
    for (const row of topicRows) {
      const list = topicsBySet.get(row.studySetId) ?? [];
      list.push(row.category);
      topicsBySet.set(row.studySetId, list);
    }

    const sets: StudySetSummary[] = setRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      subjectSlug: row.subjectSlug,
      subjectIconKey: row.subjectIconKey,
      iconKey: row.iconKey,
      questionCount: countBySet.get(row.id) ?? 0,
      createdAt: row.createdAt.toISOString(),
      testAt: row.testAt,
      testCompletedAt: row.testCompletedAt ? row.testCompletedAt.toISOString() : null,
      topics: topicsBySet.get(row.id) ?? [],
    }));

    const subjectSummaries: SubjectSummary[] = subjectRows.map((row) => {
      const subjectSets = sets.filter((set) => set.subjectId === row.id);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        iconKey: row.iconKey,
        sortOrder: row.sortOrder,
        setCount: subjectSets.length,
        questionCount: subjectSets.reduce((total, set) => total + set.questionCount, 0),
      };
    });

    const stats: LibraryStats = {
      studySets: sets.length,
      questions: sets.reduce((total, set) => total + set.questionCount, 0),
      subjects: subjectSummaries.filter((subject) => subject.setCount > 0).length,
    };

    return {
      subjects: subjectSummaries,
      sets,
      stats,
      source: 'database',
      databaseError: false,
    };
  } catch (error) {
    console.error('[library] database query failed, using bundled snapshot', error);
    return { ...buildBundledLibrary(), databaseError: isDatabaseConfigured };
  }
});

export interface StudySetDetail {
  slug: string;
  title: string;
  description: string;
  section: string;
  questions: Question[];
}

/** Questions for the study and test routes, read from Neon. */
export const getStudySet = cache(async (slug: string): Promise<StudySetDetail | null> => {
  if (!db) return bundledStudySet(slug);

  try {
    const [row] = await db
      .select({
        id: studySets.id,
        slug: studySets.slug,
        title: studySets.title,
        description: studySets.description,
        subjectName: subjects.name,
      })
      .from(studySets)
      .innerJoin(subjects, eq(studySets.subjectId, subjects.id))
      .where(eq(studySets.slug, slug))
      .limit(1);

    if (!row) return bundledStudySet(slug);

    const questionRows = await db
      .select({
        prompt: questions.prompt,
        answer: questions.answer,
        category: questions.category,
        choices: questions.choices,
      })
      .from(questions)
      .where(eq(questions.studySetId, row.id))
      .orderBy(asc(questions.sortOrder), asc(questions.id));

    if (questionRows.length === 0) return bundledStudySet(slug);

    return {
      slug: row.slug,
      title: row.title,
      description: row.description ?? '',
      section: row.subjectName,
      questions: questionRows.map((question) => ({
        cat: question.category,
        question: question.prompt,
        answer: question.answer,
        ...(question.choices && question.choices.length > 0
          ? { choices: question.choices }
          : {}),
      })),
    };
  } catch (error) {
    console.error('[library] failed to load study set, using bundled snapshot', error);
    return bundledStudySet(slug);
  }
});

function bundledStudySet(slug: string): StudySetDetail | null {
  const quiz = getQuiz(slug);
  if (!quiz) return null;
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    section: quiz.section ?? 'Other',
    questions: quiz.questions,
  };
}
