import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — Administrators only.', 403);

  const { id } = await params;
  const { full_name, email, role, password } = await request.json();

  const admin = createAdminClient();

  // Verify target belongs to same business
  const { data: target } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', id)
    .eq('business_id', session.businessId)
    .single();
  if (!target) return jsonError('User not found.', 404);

  // Validate role if changing it
  const validRoles = ['Administrator', 'Manager', 'Sales Staff', 'Warehouse Staff'];
  if (role !== undefined && !validRoles.includes(role)) return jsonError('Invalid role.');

  // Validate password if changing it
  if (password !== undefined && password !== '' && password.length < 6) {
    return jsonError('Password must be at least 6 characters.');
  }

  // Build auth update (email and/or password)
  const authUpdate: { email?: string; password?: string } = {};
  if (email?.trim())                    authUpdate.email    = email.trim();
  if (password && password.length >= 6) authUpdate.password = password;

  if (Object.keys(authUpdate).length > 0) {
    const { error: authErr } = await admin.auth.admin.updateUserById(id, authUpdate);
    if (authErr) return jsonError(authErr.message);
  }

  // Build profile update (name and/or role)
  const profileUpdate: { full_name?: string; role?: string } = {};
  if (full_name !== undefined) profileUpdate.full_name = full_name.trim();
  if (role      !== undefined) profileUpdate.role      = role;

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileErr } = await admin
      .from('user_profiles')
      .update(profileUpdate)
      .eq('id', id)
      .eq('business_id', session.businessId);
    if (profileErr) return jsonError(profileErr.message);
  }

  return jsonOk({ success: true });
}

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
