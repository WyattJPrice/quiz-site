'use client';

import { createAuthClient } from '@neon/auth/next';

export const authClient = createAuthClient();

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}
