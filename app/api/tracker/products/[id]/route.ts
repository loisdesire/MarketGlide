import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager'].includes(session.role)) return jsonError('Forbidden', 403);

  const { id } = await params;
  const body   = await request.json() as Record<string, unknown>;

  const ALLOWED = new Set(['name', 'sku', 'description', 'category', 'unit', 'cost_price', 'sell_price', 'low_stock_threshold', 'image_url']);
  const safeBody = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.has(k)));
  if (!Object.keys(safeBody).length) return jsonError('No valid fields to update.', 400);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .update(safeBody)
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
