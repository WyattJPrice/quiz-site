import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Subjects are the top-level grouping used by the library filters and sections.
 * Subjects are currently shared (single-user site), so there is no owner column.
 */
export const subjects = pgTable(
  'subjects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    iconKey: text('icon_key'),
    sortOrder: integer('sort_order'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('subjects_slug_key').on(table.slug),
    index('subjects_sort_order_idx').on(table.sortOrder),
  ],
);

/**
 * A study set. Question counts are derived from the questions table rather than
 * stored twice, so they can never drift.
 *
 * `test_at` is a scheduled test date (date-only, no timezone). A completed test
 * hides the date in the UI; nothing marks a set complete automatically. The app
 * has a single test per set, so completion is tracked on the set
 * (`test_completed_at`) rather than in a separate attempts table.
 */
export const studySets = pgTable(
  'study_sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subjectId: uuid('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    iconKey: text('icon_key'),
    testAt: date('test_at'),
    testCompletedAt: timestamp('test_completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('study_sets_slug_key').on(table.slug),
    index('study_sets_created_at_idx').on(table.createdAt),
    index('study_sets_subject_id_idx').on(table.subjectId),
  ],
);

/**
 * Questions keep the exact shape the quiz and learn engines understand:
 * `category` is the existing `cat` badge, `answer` keeps comma/slash syntax for
 * multiple blanks, and `choices` holds multiple-choice options.
 */
export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studySetId: uuid('study_set_id')
      .notNull()
      .references(() => studySets.id, { onDelete: 'cascade' }),
    prompt: text('prompt').notNull(),
    answer: text('answer').notNull(),
    questionType: text('question_type').notNull().default('fill_blank'),
    category: text('category').notNull(),
    choices: jsonb('choices').$type<string[] | null>(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('questions_study_set_id_idx').on(table.studySetId),
    uniqueIndex('questions_study_set_sort_order_key').on(table.studySetId, table.sortOrder),
  ],
);

export type SubjectRow = typeof subjects.$inferSelect;
export type StudySetRow = typeof studySets.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
