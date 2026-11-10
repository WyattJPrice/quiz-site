import type { LibraryData, StudySetSummary, SubjectSummary } from './library-types';
import { quizzes } from '../data';

/**
 * Metadata for the study sets that lived in `data/` before the Neon migration.
 * Creation timestamps come from the commit that first added each data file, so
 * "newest first" ordering matches the sets' real creation order. Sets that share
 * an exact timestamp are staggered by one second in declaration order to keep a
 * stable secondary sort key. No test dates are invented here: every set is
 * imported with `test_at = null`.
 */
export const LEGACY_CREATED_AT: Record<string, string> = {
  skeletal: '2026-04-29T21:35:14-05:00',
  muscular: '2026-04-29T21:35:14-05:00',
  nervous: '2026-04-29T21:35:14-05:00',
  'skin-eye': '2026-04-29T21:35:14-05:00',
  'bacteria-virus': '2026-04-29T21:35:14-05:00',
  perch: '2026-04-29T21:35:14-05:00',
  protist: '2026-04-29T21:35:14-05:00',
  'endocrine-disease': '2026-05-11T02:37:50+00:00',
  'egg-embryo': '2026-05-12T22:34:56-05:00',
  'final-review': '2026-05-16T22:42:03-05:00',
  'english-ii': '2026-05-18T18:44:19-05:00',
  'french-final': '2026-05-19T23:43:25-05:00',
  'salvation-history': '2026-05-19T23:43:25-05:00',
  'crucible-act-2': '2026-09-22T06:45:02-05:00',
  'us-history-unit-3': '2026-10-12T19:48:49-05:00',
  'chemistry-periodic-table': '2026-11-09T06:55:57-06:00',
  'red-badge-ch1-6': '2026-11-09T06:55:57-06:00',
  'religion-ch4': '2026-11-09T18:06:53-06:00',
};

const FALLBACK_CREATED_AT = '2026-01-01T00:00:00.000Z';

export function legacyCreatedAtMap(): Record<string, string> {
  const result: Record<string, string> = {};
  const seen = new Map<string, number>();

  for (const quiz of quizzes) {
    const base = new Date(LEGACY_CREATED_AT[quiz.slug] ?? FALLBACK_CREATED_AT).getTime();
    const key = new Date(base).toISOString();
    const offset = seen.get(key) ?? 0;
    seen.set(key, offset + 1);
    result[quiz.slug] = new Date(base + offset * 1000).toISOString();
  }

  return result;
}

interface SubjectMeta {
  name: string;
  slug: string;
  iconKey: string;
  sortOrder: number;
}

export const LEGACY_SUBJECTS: SubjectMeta[] = [
  { name: 'Biology', slug: 'biology', iconKey: 'microscope', sortOrder: 1 },
  { name: 'English II', slug: 'english-ii', iconKey: 'book-open', sortOrder: 2 },
  { name: 'Salvation History', slug: 'salvation-history', iconKey: 'church', sortOrder: 3 },
  { name: 'French', slug: 'french', iconKey: 'languages', sortOrder: 4 },
  { name: 'US History', slug: 'us-history', iconKey: 'landmark', sortOrder: 5 },
  { name: 'Chemistry', slug: 'chemistry', iconKey: 'flask', sortOrder: 6 },
  { name: 'Religion Chapter 4', slug: 'religion-chapter-4', iconKey: 'book', sortOrder: 7 },
];

export function subjectMetaFor(name: string, index: number): SubjectMeta {
  return (
    LEGACY_SUBJECTS.find((subject) => subject.name === name) ?? {
      name,
      slug: slugify(name),
      iconKey: 'book-open',
      sortOrder: LEGACY_SUBJECTS.length + index + 1,
    }
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SET_ICON_KEYS: Record<string, string> = {
  'final-review': 'clipboard-list',
  skeletal: 'bone',
  muscular: 'dumbbell',
  nervous: 'brain',
  'skin-eye': 'eye',
  'bacteria-virus': 'microscope',
  perch: 'fish',
  protist: 'microscope',
  'endocrine-disease': 'dna',
  'egg-embryo': 'egg',
  'english-ii': 'book-open',
  'crucible-act-2': 'scale',
  'red-badge-ch1-6': 'book-marked',
  'salvation-history': 'church',
  'french-final': 'languages',
  'us-history-unit-3': 'landmark',
  'chemistry-periodic-table': 'flask',
  'religion-ch4': 'book',
};

/** Bundled snapshot used only when DATABASE_URL is missing or unreachable. */
export function buildBundledLibrary(): LibraryData {
  const createdAtMap = legacyCreatedAtMap();

  const subjects: SubjectSummary[] = LEGACY_SUBJECTS.map((subject) => ({
    id: `bundled-subject-${subject.slug}`,
    name: subject.name,
    slug: subject.slug,
    iconKey: subject.iconKey,
    sortOrder: subject.sortOrder,
    setCount: 0,
    questionCount: 0,
  }));

  const sets: StudySetSummary[] = quizzes.map((quiz) => {
    const sectionName = quiz.section ?? 'Other';
    const meta = subjectMetaFor(sectionName, subjects.length);
    let subject = subjects.find((item) => item.slug === meta.slug);
    if (!subject) {
      subject = {
        id: `bundled-subject-${meta.slug}`,
        name: meta.name,
        slug: meta.slug,
        iconKey: meta.iconKey,
        sortOrder: meta.sortOrder,
        setCount: 0,
        questionCount: 0,
      };
      subjects.push(subject);
    }

    subject.setCount += 1;
    subject.questionCount += quiz.questions.length;

    return {
      id: `bundled-set-${quiz.slug}`,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description || null,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectSlug: subject.slug,
      subjectIconKey: subject.iconKey,
      iconKey: SET_ICON_KEYS[quiz.slug] ?? 'book-open',
      questionCount: quiz.questions.length,
      createdAt: createdAtMap[quiz.slug],
      testAt: null,
      testCompletedAt: null,
      topics: Array.from(new Set(quiz.questions.map((question) => question.cat))),
    } satisfies StudySetSummary;
  });

  const sortedSets = [...sets].sort((a, b) => {
    const delta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return delta !== 0 ? delta : b.slug.localeCompare(a.slug);
  });

  return {
    subjects: subjects.filter((subject) => subject.setCount > 0),
    sets: sortedSets,
    stats: {
      studySets: sets.length,
      questions: sets.reduce((total, set) => total + set.questionCount, 0),
      subjects: subjects.filter((subject) => subject.setCount > 0).length,
    },
    source: 'bundled',
    databaseError: false,
  };
}
