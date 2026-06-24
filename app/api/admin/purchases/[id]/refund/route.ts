import Stripe from 'stripe';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();

  // Fetch the purchase
  const { data: purchase, error: fetchErr } = await admin
    .from('user_purchases')
    .select('id, status, stripe_payment_intent, payment_provider, amount_usd')
    .eq('id', id)
    .single();

  if (fetchErr || !purchase) return jsonError('Purchase not found.', 404);
  if (purchase.status === 'refunded') return jsonError('Already refunded.');
  if (purchase.payment_provider !== 'stripe') return jsonError('Only Stripe purchases can be refunded here.');
  if (!purchase.stripe_payment_intent) return jsonError('No payment intent on record — refund manually in Stripe dashboard.');

  // Issue refund via Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  try {
    await stripe.refunds.create({ payment_intent: purchase.stripe_payment_intent });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe refund failed.';
    return jsonError(msg);
  }

  // Mark as refunded in DB
  const { error: updateErr } = await admin
    .from('user_purchases')
    .update({ status: 'refunded' })
    .eq('id', id);

  if (updateErr) return jsonError('Refund issued in Stripe but DB update failed: ' + updateErr.message);

  return jsonOk({ refunded: true });
}
