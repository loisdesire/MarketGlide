import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — only Administrators can change user roles.', 403);

  const { id }   = await params;
  const { role } = await request.json();

  const validRoles = ['Administrator', 'Manager', 'Sales Staff', 'Warehouse Staff'];
  if (!validRoles.includes(role)) return jsonError('Invalid role.');

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('user_profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data);
}
