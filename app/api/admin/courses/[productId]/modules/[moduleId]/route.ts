import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

type Params = { params: Promise<{ productId: string; moduleId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { moduleId } = await params;
  const body = await req.json() as { title?: string; sort_order?: number };

  const admin = createAdminClient();
  const { data, error: err } = await admin
    .from('course_modules')
    .update(body)
    .eq('id', moduleId)
    .select()
    .single();

  if (err) return jsonError(err.message);
  return jsonOk(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { moduleId } = await params;
  const admin = createAdminClient();
  const { error: err } = await admin.from('course_modules').delete().eq('id', moduleId);
  if (err) return jsonError(err.message);
  return jsonOk({ deleted: true });
}
