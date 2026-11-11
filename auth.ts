import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { accounts, sessions, users, verificationTokens } from '@/db/schema';

/**
 * Same shape as classlink: NextAuth v5, Google as the only provider, database
 * sessions, and an editable `display_name`. The adapter tables live in the
 * study site's Neon database instead of Supabase, so there is one database.
 *
 * Without DATABASE_URL (a fresh clone, or a build machine with no env) the app
 * still renders signed out and falls back to JWT sessions so nothing crashes.
 */
const adapter = db
  ? DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [Google],
  session: { strategy: adapter ? 'database' : 'jwt' },
  pages: { signIn: '/signin' },
  trustHost: true,
  callbacks: {
    session(params) {
      const { session } = params;
      const user = (params as { user?: { id?: string; displayName?: string | null } }).user;
      const token = (params as { token?: { sub?: string; displayName?: string | null } }).token;

      if (session.user) {
        const id = user?.id ?? token?.sub;
        if (id) session.user.id = id;

        const displayName = user?.displayName ?? token?.displayName ?? '';
        session.user.displayName = displayName.trim() || undefined;
      }

      return session;
    },
  },
});
