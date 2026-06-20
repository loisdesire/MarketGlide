import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import type { UserRole } from './permissions';

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSessionUserWithRole(): Promise<{
  userId: string;
  role: UserRole;
  businessId: string;
} | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('user_profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  if (!data?.role || !data?.business_id) return null;
  return { userId: user.id, role: data.role as UserRole, businessId: data.business_id };
}

export function jsonOk(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
