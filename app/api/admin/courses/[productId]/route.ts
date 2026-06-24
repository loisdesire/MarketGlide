import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

type Params = { params: Promise<{ productId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { productId } = await params;
  const admin = createAdminClient();

  const { data: modules, error: err } = await admin
    .from('course_modules')
    .select('id, title, sort_order, course_lessons(id, title, description, video_url, duration_s, is_preview, sort_order)')
    .eq('product_id', productId)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'course_lessons' });

  if (err) return jsonError(err.message);
  return jsonOk(modules ?? []);
}

export async function POST(req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { productId } = await params;
  const { title, sort_order } = await req.json() as { title: string; sort_order?: number };
  if (!title?.trim()) return jsonError('Title is required.');

  const admin = createAdminClient();
  const { data, error: err } = await admin
    .from('course_modules')
    .insert({ product_id: productId, title: title.trim(), sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (err) return jsonError(err.message);
  return jsonOk(data, 201);
}
