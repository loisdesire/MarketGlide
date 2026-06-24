import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

type Params = { params: Promise<{ productId: string; lessonId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { lessonId } = await params;
  const body = await req.json() as Record<string, unknown>;

  const ALLOWED = new Set(['title','description','video_url','duration_s','is_preview','sort_order']);
  const safe = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.has(k)));

  const admin = createAdminClient();
  const { data, error: err } = await admin
    .from('course_lessons')
    .update(safe)
    .eq('id', lessonId)
    .select()
    .single();

  if (err) return jsonError(err.message);
  return jsonOk(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { lessonId } = await params;
  const admin = createAdminClient();
  const { error: err } = await admin.from('course_lessons').delete().eq('id', lessonId);
  if (err) return jsonError(err.message);
  return jsonOk({ deleted: true });
}
