import { sql } from 'drizzle-orm';
import {
  bigserial,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { LearnSessionState } from '@/lib/learn-types';

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

/**
 * Auth.js (NextAuth v5) tables. Classlink runs the same library with Google and
 * database sessions; the adapter tables live in this database instead of
 * Supabase, so there is still exactly one database for the study site.
 *
 * `display_name` is the editable username shown in the sidebar and on the
 * leaderboard; `name` stays the Google profile name.
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: timestamp('email_verified', { withTimezone: true }),
    image: text('image'),
    displayName: text('display_name'),
  },
  (table) => [uniqueIndex('users_display_name_lower_key').on(sql`lower(${table.displayName})`)],
);

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = pgTable(
  'sessions',
  {
    sessionToken: text('session_token').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

export const verificationTokens = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

/** Where a signed-in student stopped in a set, so another device can resume. */
export const quizProgress = pgTable(
  'quiz_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    studySetId: uuid('study_set_id')
      .notNull()
      .references(() => studySets.id, { onDelete: 'cascade' }),
    state: jsonb('state').$type<LearnSessionState>().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.studySetId] })],
);

/** One row per finished set, the only thing the leaderboard and stats read. */
export const quizResults = pgTable(
  'quiz_results',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    studySetId: uuid('study_set_id')
      .notNull()
      .references(() => studySets.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull(),
    answered: integer('answered').notNull(),
    correct: integer('correct').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('quiz_results_user_created_idx').on(table.userId, table.createdAt),
    index('quiz_results_study_set_idx').on(table.studySetId),
    check('quiz_results_mode_check', sql`${table.mode} in ('learn', 'test')`),
    check('quiz_results_counts_check', sql`${table.correct} >= 0 and ${table.correct} <= ${table.answered}`),
  ],
);

/** Claims a guest device against an account so the import only ever runs once. */
export const guestMerges = pgTable(
  'guest_merges',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: text('device_id').notNull(),
    mergedAt: timestamp('merged_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.deviceId] })],
);

export type SubjectRow = typeof subjects.$inferSelect;
export type StudySetRow = typeof studySets.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type QuizProgressRow = typeof quizProgress.$inferSelect;
export type QuizResultRow = typeof quizResults.$inferSelect;
