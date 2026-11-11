'use server';

import { redirect } from 'next/navigation';
import { authConfigured, signIn, signOut } from '@/auth';

function safeRedirect(value: FormDataEntryValue | null): string {
  const target = typeof value === 'string' ? value : '';
  if (!target.startsWith('/') || target.startsWith('//')) return '/';
  return target;
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!authConfigured) {
    redirect('/signin?error=unconfigured');
  }

  await signIn('google', { redirectTo: safeRedirect(formData.get('redirectTo')) });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
