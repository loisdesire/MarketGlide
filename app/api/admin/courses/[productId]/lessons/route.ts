import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

type Params = { params: Promise<{ productId: string }> };

export async function POST(req: Request, { params: _params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as {
    module_id:   string;
    title:       string;
    description?: string;
    video_url?:  string;
    duration_s?: number;
    is_preview?: boolean;
    sort_order?: number;
  };

  if (!body.module_id) return jsonError('module_id is required.');
  if (!body.title?.trim()) return jsonError('Title is required.');

  const admin = createAdminClient();
  const { data, error: err } = await admin
    .from('course_lessons')
    .insert({
      module_id:   body.module_id,
      title:       body.title.trim(),
      description: body.description?.trim() ?? '',
      video_url:   body.video_url?.trim() ?? '',
      duration_s:  body.duration_s ?? 0,
      is_preview:  body.is_preview ?? false,
      sort_order:  body.sort_order ?? 0,
    })
    .select()
    .single();

  if (err) return jsonError(err.message);
  return jsonOk(data, 201);
}
