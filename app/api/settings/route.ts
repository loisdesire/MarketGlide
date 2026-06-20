import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('businesses')
    .select('name, email, address')
    .eq('id', session.businessId)
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data);
}

export async function PATCH(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (session.role !== 'Administrator') return jsonError('Forbidden — only Administrators can change business settings.', 403);

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('businesses')
    .update({ name: body.name, email: body.email, address: body.address })
    .eq('id', session.businessId)
    .select()
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data);
}
