import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager'].includes(session.role)) return jsonError('Forbidden', 403);

  const { id } = await params;
  const admin   = createAdminClient();
  const { error } = await admin
    .from('sales')
    .delete()
    .eq('id', id)
    .eq('business_id', session.businessId);
  if (error) return jsonError(error.message);
  return jsonOk({ success: true });
}
