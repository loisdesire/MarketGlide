import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager', 'Warehouse Staff'].includes(session.role)) return jsonError('Forbidden', 403);

  const { product_id, qty_change, reason } = await request.json();
  if (!product_id) return jsonError('product_id is required.');
  if (typeof qty_change !== 'number') return jsonError('qty_change must be a number.');

  const admin = createAdminClient();

  const { data: product, error: prodErr } = await admin
    .from('products')
    .select('id, stock_qty')
    .eq('id', product_id)
    .single();
  if (prodErr || !product) return jsonError('Product not found.', 404);

  const newQty = product.stock_qty + qty_change;
  if (newQty < 0) return jsonError('Adjustment would result in negative stock.');

  await admin.from('products').update({ stock_qty: newQty }).eq('id', product_id);
  await admin.from('inventory_adjustments').insert({
    date:        new Date().toISOString().slice(0, 10),
    product_id,
    qty_change,
    reason:      reason ?? 'Manual adjustment',
    source_type: 'manual',
    created_by:  session.userId,
  });

  return jsonOk({ success: true, new_stock: newQty });
}
