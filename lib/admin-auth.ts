import { getSessionUser, jsonError } from '@/lib/api-helpers';

export async function getAdminUser() {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.email !== process.env.PLATFORM_ADMIN_EMAIL) return null;
  return user;
}

export async function requireAdmin(): Promise<
  | { user: Awaited<ReturnType<typeof getSessionUser>> & {}; error: null }
  | { user: null; error: Response }
> {
  const user = await getAdminUser();
  if (!user) return { user: null, error: jsonError('Forbidden', 403) };
  return { user, error: null };
}
