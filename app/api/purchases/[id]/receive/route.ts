import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager', 'Warehouse Staff'].includes(session.role)) return jsonError('Forbidden', 403);

  const { id } = await params;
  const admin   = createAdminClient();

  // Fetch the PO
  const { data: po, error: poErr } = await admin
    .from('purchase_orders')
    .select('*')
    .eq('id', id)
    .single();
  if (poErr || !po) return jsonError('Purchase order not found.', 404);
  if (po.status === 'Received') return jsonError('This order has already been received.');
  if (po.status === 'Cancelled') return jsonError('Cannot receive a cancelled order.');

  // Fetch the product
  const { data: product, error: prodErr } = await admin
    .from('products')
    .select('id, stock_qty, cost_price')
    .eq('id', po.product_id)
    .single();
  if (prodErr || !product) return jsonError('Product not found.', 404);

  // Update PO status
  const { error: poUpdateErr } = await admin
    .from('purchase_orders')
    .update({ status: 'Received', received_at: new Date().toISOString() })
    .eq('id', id);
  if (poUpdateErr) return jsonError(poUpdateErr.message);

  // Update product stock and cost price
  const newStock = product.stock_qty + po.qty;
  const { error: prodUpdateErr } = await admin
    .from('products')
    .update({ stock_qty: newStock, cost_price: po.unit_landed_cost || product.cost_price })
    .eq('id', po.product_id);
  if (prodUpdateErr) return jsonError(prodUpdateErr.message);

  // Log the inventory adjustment
  await admin.from('inventory_adjustments').insert({
    date: new Date().toISOString().slice(0, 10),
    product_id: po.product_id,
    qty_change: po.qty,
    reason: `Received PO ${po.po_number}`,
    source_type: 'purchase',
    source_id: id,
    created_by: session.userId,
  });

  return jsonOk({ success: true, new_stock: newStock });
}
