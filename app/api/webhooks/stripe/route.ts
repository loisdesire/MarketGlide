import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  if (!sig) return new Response('Missing stripe-signature header', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as Stripe.Checkout.Session;
    const { product_id, user_id } = session.metadata ?? {};

    if (!product_id) return new Response('Missing product_id in metadata', { status: 400 });

    const email = session.customer_details?.email ?? session.customer_email ?? '';

    const admin = createAdminClient();
    const { error } = await admin.from('user_purchases').insert({
      user_id:               user_id || null,
      product_id,
      email,
      amount_usd:            (session.amount_total ?? 0) / 100,
      payment_provider:      'stripe',
      stripe_session_id:     session.id,
      stripe_payment_intent: (session.payment_intent as string) ?? null,
      status:                'completed',
    });

    if (error) {
      console.error('user_purchases insert failed:', error.message);
      return new Response('DB insert failed', { status: 500 });
    }
  }

  return new Response('ok');
}
