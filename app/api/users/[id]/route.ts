import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — Administrators only.', 403);

  const { id } = await params;

  if (id === session.userId) return jsonError('You cannot remove your own account.');

  const admin = createAdminClient();

  // Guard: target must belong to same business
  const { data: target } = await admin
    .from('user_profiles')
    .select('role, business_id')
    .eq('id', id)
    .eq('business_id', session.businessId)
    .single();
  if (!target) return jsonError('User not found.', 404);

  // Guard: cannot remove the last Administrator in this business
  if (target.role === 'Administrator') {
    const { count } = await admin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'Administrator')
      .eq('business_id', session.businessId);
    if ((count ?? 0) <= 1) return jsonError('Cannot remove the last Administrator.');
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return jsonError(error.message);

  return jsonOk({ success: true });
}
