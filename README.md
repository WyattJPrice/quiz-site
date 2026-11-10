# Study Library

A study library for organizing sets by subject, studying with quick repetition, and
taking practice tests. Built with Next.js 15, Neon PostgreSQL, and Drizzle ORM.

## Features

- Subject-grouped library with search, subject filters, and live statistics
- Light and dark themes (Sora headings, Geist body, Geist Mono metadata)
- Learn mode (quick repetition of terms, progress saved in localStorage)
- Test mode with multiple choice and fill-in-the-blank questions
- Fuzzy matching and answer-order detection
- Newest sets first, ordered by creation time
- Scheduled test dates that hide once a test is complete

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Neon PostgreSQL** for persistent storage
- **Drizzle ORM** for the schema, versioned migrations, and typed queries
- No external UI library — custom CSS in `app/globals.css` and `app/library.css`

## Getting started

```bash
npm install
cp .env.example .env   # then paste your Neon connection string
npm run db:migrate     # apply versioned migrations from db/migrations
npm run db:seed        # import the existing study sets and questions
npm run dev
```

`DATABASE_URL` is server-side only. Never commit the real value; `.env` is
gitignored, and the deployment environment needs its own copy.

## Database commands

| Command | Purpose |
| --- | --- |
| `npm run db:generate` | Generate a new SQL migration after editing `db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Import/refresh the study sets from `data/` (idempotent) |

The seed script keeps stable UUIDs, so re-running it updates existing rows rather
than creating duplicates. It never changes a set's `created_at` after the first
import and never overwrites a scheduled or completed test date.

## Data model

- `subjects` — name, slug, monochrome icon key, optional sort order
- `study_sets` — subject, slug, title, description, icon, `created_at`,
  `updated_at`, optional `test_at` and `test_completed_at`
- `questions` — prompt, answer (existing comma/slash syntax preserved),
  question type, category, optional multiple-choice options, sort order

Question counts are derived from `questions` rather than stored on the set, and
library queries order by `created_at DESC` with a stable tie-breaker. The app has
one test per set, so completion is stored on the set instead of a separate
attempts table.

## Test dates

The seed deliberately imports **no test dates**: no `test_at` or
`test_completed_at` value is invented for an existing set. The card only shows
`Test: <date>` for a scheduled date that is upcoming and not completed. Completed
tests and sets without a date show nothing, and a past date is never treated as
completed automatically.

## Deployment

1. Create a Neon project/branch for production.
2. Add `DATABASE_URL` to the deployment environment (for example Vercel →
   Project → Settings → Environment Variables).
3. Run `npm run db:migrate` against the production database.
4. Run `npm run db:seed` against the production database.
5. Deploy and confirm the library renders database statistics.

## Rollback

Before the first production import, keep a copy of `data/` (the original source of
truth) and take a Neon branch or `pg_dump` snapshot. To roll back:

1. Restore the snapshot (or point `DATABASE_URL` at the pre-migration branch).
2. Redeploy the previous build.
3. The app falls back to the bundled `data/` snapshot if `DATABASE_URL` is missing,
   but production should always use Neon.
