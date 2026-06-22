import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('platform_products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json() as Record<string, unknown>;
  if (!body.title) return jsonError('Title is required.');
  if (!body.slug)  return jsonError('Slug is required.');

  const ALLOWED = new Set(['slug','title','description','type','category','price_usd','stripe_price_id','cover_url','file_url','is_active','sort_order']);
  const safeBody = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.has(k)));

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('platform_products')
    .insert(safeBody)
    .select()
    .single();

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data, 201);
}
