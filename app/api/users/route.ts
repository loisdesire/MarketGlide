import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — Administrators only.', 403);

  const admin = createAdminClient();

  // Fetch profiles scoped to this business
  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id, full_name, role')
    .eq('business_id', session.businessId)
    .order('full_name');

  if (!profiles?.length) return jsonOk([]);

  // Fetch auth users to get emails — then merge
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

  const result = authUsers
    .filter(u => profileMap.has(u.id))
    .map(u => ({
      id:        u.id,
      email:     u.email ?? '',
      full_name: profileMap.get(u.id)?.full_name ?? '',
      role:      profileMap.get(u.id)?.role ?? '',
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  return jsonOk(result);
}
