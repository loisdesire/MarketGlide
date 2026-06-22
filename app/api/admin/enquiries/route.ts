import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('service_enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data);
}
