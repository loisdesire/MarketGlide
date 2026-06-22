import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { status } = await request.json();

  const VALID = ['new', 'contacted', 'closed'];
  if (!VALID.includes(status)) return jsonError('Invalid status.');

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('service_enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data);
}
