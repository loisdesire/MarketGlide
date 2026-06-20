import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager'].includes(session.role)) return jsonError('Forbidden', 403);

  const { id } = await params;
  const body   = await request.json();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .update(body)
    .eq('id', id)
    .eq('business_id', session.businessId)
    .select()
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager'].includes(session.role)) return jsonError('Forbidden', 403);

  const { id } = await params;
  const admin   = createAdminClient();
  const { error } = await admin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('business_id', session.businessId);
  if (error) return jsonError(error.message);
  return jsonOk({ success: true });
}
