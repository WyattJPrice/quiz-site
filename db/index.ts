import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(connectionString);

/**
 * Neon's HTTP driver works in server components and route handlers without a
 * long-lived connection pool. When DATABASE_URL is absent (for example a fresh
 * clone with no env file) the app falls back to the bundled study data so the
 * UI still renders. Production always sets DATABASE_URL.
 */
export const db: NeonHttpDatabase<typeof schema> | null = connectionString
  ? drizzle(neon(connectionString), { schema })
  : null;
