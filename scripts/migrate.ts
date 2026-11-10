import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Add it to .env before migrating.');
    process.exitCode = 1;
    return;
  }

  const db = drizzle(neon(url));
  await migrate(db, { migrationsFolder: 'db/migrations' });
  console.log('Applied pending migrations from db/migrations.');
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
