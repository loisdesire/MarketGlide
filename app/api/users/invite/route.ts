import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_ROLES = ['Administrator', 'Manager', 'Sales Staff', 'Warehouse Staff'];

export async function POST(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — Administrators only.', 403);

  const { email, full_name, password, role } = await request.json();
  if (!email)                            return jsonError('Email is required.');
  if (!password || password.length < 6)  return jsonError('Password must be at least 6 characters.');
  if (!VALID_ROLES.includes(role))       return jsonError('Invalid role.');

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name ?? '', role },
  });
  if (error) return jsonError(error.message);

  // Upsert profile with the same business_id as the inviting admin
  await admin.from('user_profiles').upsert(
    {
      id:          data.user.id,
      full_name:   full_name ?? '',
      role,
      business_id: session.businessId,
    },
    { onConflict: 'id' },
  );

  return jsonOk({ id: data.user.id, email: data.user.email });
}
