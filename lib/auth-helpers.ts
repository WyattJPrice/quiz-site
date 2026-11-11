import { auth } from '@/auth';
import { db } from '@/db';

export interface SessionUser {
  id: string;
  displayName: string | null;
  name: string | null;
  image: string | null;
  email: string | null;
}

/** The signed-in user, shaped for the shell, or null when signed out. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;

  return {
    id: user.id,
    displayName: user.displayName ?? null,
    name: user.name ?? null,
    image: user.image ?? null,
    email: user.email ?? null,
  };
}

/** True when the request comes from this origin; mutations refuse otherwise. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const host = request.headers.get('host');
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function databaseMissing() {
  return db === null;
}
