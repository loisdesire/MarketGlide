import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { RESTOCK_STATUSES } from '@/lib/constants';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager', 'Sales Staff'].includes(session.role)) return jsonError('Forbidden', 403);

  const { id }                      = await params;
  const { status: newStatus, force } = await request.json();

  const admin = createAdminClient();

  const { data: sale, error: saleErr } = await admin
    .from('sales')
    .select('id, status, stock_deducted, qty, product_id, invoice_number')
    .eq('id', id)
    .single();
  if (saleErr || !sale) return jsonError('Sale not found.', 404);
  if (sale.status === newStatus) return jsonOk({ message: 'No change.' });

  const { data: product } = await admin
    .from('products')
    .select('id, stock_qty')
    .eq('id', sale.product_id)
    .single();

  const wasRestock  = RESTOCK_STATUSES.includes(sale.status);
  const willRestock = RESTOCK_STATUSES.includes(newStatus);
  let   newStockQty = product?.stock_qty ?? 0;

  if (!wasRestock && willRestock) {
    // Moving TO cancelled/refunded → return stock
    newStockQty = newStockQty + sale.qty;
    await admin.from('products').update({ stock_qty: newStockQty }).eq('id', sale.product_id);
    await admin.from('inventory_adjustments').insert({
      date:        new Date().toISOString().slice(0, 10),
      product_id:  sale.product_id,
      qty_change:  sale.qty,
      reason:      `Sale ${sale.invoice_number} marked ${newStatus}`,
      source_type: 'sale',
      source_id:   id,
      created_by:  session.userId,
    });

  } else if (wasRestock && !willRestock) {
    // Moving FROM cancelled/refunded → re-deduct stock
    if ((product?.stock_qty ?? 0) < sale.qty && !force) {
      return Response.json({
        error: `Only ${product?.stock_qty ?? 0} unit(s) in stock.`,
        confirm: `Only ${product?.stock_qty ?? 0} unit(s) of this product are currently in stock. Setting this sale back to "${newStatus}" will take stock negative. Continue anyway?`,
      }, { status: 409 });
    }
    newStockQty = Math.max(0, newStockQty - sale.qty);
    await admin.from('products').update({ stock_qty: newStockQty }).eq('id', sale.product_id);
    await admin.from('inventory_adjustments').insert({
      date:        new Date().toISOString().slice(0, 10),
      product_id:  sale.product_id,
      qty_change:  -sale.qty,
      reason:      `Sale ${sale.invoice_number} reactivated as ${newStatus}`,
      source_type: 'sale',
      source_id:   id,
      created_by:  session.userId,
    });
  }

  await admin.from('sales').update({
    status:        newStatus,
    stock_deducted: !willRestock,
    updated_by:    session.userId,
  }).eq('id', id);

  return jsonOk({ success: true, new_stock: newStockQty });
}
