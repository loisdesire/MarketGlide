import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — only Administrators can change business settings.', 403);

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('business_settings')
    .update({ ...body, updated_by: session.userId })
    .eq('id', 1)
    .select()
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data);
}
