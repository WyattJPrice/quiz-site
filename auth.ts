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
 * A deployment without AUTH_SECRET or Google credentials renders signed out
 * instead of throwing MissingSecret on every page; sign-in is disabled until
 * the environment is configured.
 */
const adapter = db
  ? DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  : undefined;

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const googleId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

export const authConfigured = Boolean(authSecret && googleId && googleSecret);

const providers =
  googleId && googleSecret ? [Google({ clientId: googleId, clientSecret: googleSecret })] : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  adapter,
  providers,
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
