import { auth } from '@/lib/auth/server';

const FALLBACK_ADMINS = ['wyattprice09ono@gmail.com', '28wprice@ndpios.com'];

function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  const fromEnv = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMINS;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export async function getAdminSession() {
  const { data: session } = await auth.getSession();
  if (!session?.user || !isAdminEmail(session.user.email)) return null;
  return session;
}

