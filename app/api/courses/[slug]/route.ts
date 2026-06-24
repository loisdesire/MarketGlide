import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Not authenticated.', 401);

  const admin = createAdminClient();

  // Get product
  const { data: product } = await admin
    .from('platform_products')
    .select('id, title, description, type')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) return jsonError('Product not found.', 404);

  // Check purchase (unless it's free)
  const { data: purchase } = await admin
    .from('user_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product.id)
    .eq('status', 'completed')
    .maybeSingle();

  if (!purchase) return jsonError('Not purchased.', 403);

  // Get curriculum
  const { data: modules, error: err } = await admin
    .from('course_modules')
    .select('id, title, sort_order, course_lessons(id, title, description, video_url, duration_s, is_preview, sort_order)')
    .eq('product_id', product.id)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'course_lessons' });

  if (err) return jsonError(err.message);

  // Get user's progress
  const { data: progress } = await admin
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', user.id);

  const completedIds = new Set((progress ?? []).filter(p => p.completed).map(p => p.lesson_id));

  return jsonOk({ product, modules: modules ?? [], completedIds: [...completedIds] });
}
