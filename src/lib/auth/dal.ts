import 'server-only';
import { auth } from '@/auth';
import { cache } from 'react';
import { redirect } from 'next/navigation';

export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
});

export const requireAuth = cache(async () => {
  const session = await verifySession();
  if (!session) redirect('/login');
  return session;
});

export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const session = await verifySession();
  return session?.user?.id ?? null;
});
