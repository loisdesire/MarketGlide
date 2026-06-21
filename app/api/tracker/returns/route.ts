import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager'].includes(session.role)) return jsonError('Forbidden', 403);

  const body = await request.json();
  if (!body.sale_id) return jsonError('Sale is required.');
  const qty = parseInt(String(body.qty ?? 1), 10);
  if (isNaN(qty) || qty < 1) return jsonError('Quantity must be a positive whole number.', 400);
  const refundAmount = parseFloat(String(body.refund_amount ?? 0));
  if (isNaN(refundAmount) || refundAmount < 0) return jsonError('Refund amount must be a non-negative number.', 400);

  const admin = createAdminClient();

  // Fetch the linked sale — scoped to this business
  const { data: sale } = await admin
    .from('sales')
    .select('id, product_id, invoice_number')
    .eq('id', body.sale_id)
    .eq('business_id', session.businessId)
    .single();
  if (!sale) return jsonError('Sale not found.', 404);

  // Insert the return
  const { data: ret, error: retErr } = await admin
    .from('returns')
    .insert({
      sale_id:       body.sale_id,
      date:          body.date,
      qty,
      reason:        body.reason ?? 'Defective',
      refund_amount: refundAmount,
      currency:      body.currency ?? 'USD',
      status:        body.status ?? 'Pending',
      restock:       body.restock ?? true,
      notes:         body.notes ?? '',
      business_id:   session.businessId,
      created_by:    session.userId,
    })
    .select()
    .single();
  if (retErr) return jsonError(retErr.message);

  // Restock if requested
  if (body.restock) {
    const { data: product } = await admin
      .from('products')
      .select('stock_qty')
      .eq('id', sale.product_id)
      .eq('business_id', session.businessId)
      .single();
    if (product) {
      const newQty = (product.stock_qty ?? 0) + qty;
      const { error: stockErr } = await admin.from('products').update({ stock_qty: newQty }).eq('id', sale.product_id).eq('business_id', session.businessId);
      if (stockErr) return jsonError(stockErr.message);
      const { error: adjErr } = await admin.from('inventory_adjustments').insert({
        date:        body.date ?? new Date().toISOString().slice(0, 10),
        product_id:  sale.product_id,
        qty_change:  qty,
        reason:      `Customer return for ${sale.invoice_number}`,
        source_type: 'return',
        source_id:   ret.id,
        business_id: session.businessId,
        created_by:  session.userId,
      });
      if (adjErr) return jsonError(adjErr.message);
    }
  }

  return jsonOk(ret, 201);
}
