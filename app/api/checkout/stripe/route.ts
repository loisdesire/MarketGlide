import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { slug } = await request.json() as { slug: string };
  if (!slug) return Response.json({ error: 'Product slug is required.' }, { status: 400 });

  // Get logged-in user (optional — guest checkout is allowed)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get product
  const admin = createAdminClient();
  const { data: product } = await admin
    .from('platform_products')
    .select('id, title, description, price_usd, cover_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) return Response.json({ error: 'Product not found.' }, { status: 404 });
  if (product.price_usd === 0) return Response.json({ error: 'This product is free.' }, { status: 400 });

  const origin = request.headers.get('origin') ?? 'https://flomdigital.com';
  const intro  = (product.description ?? '').split('\n')[0] || undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          ...(intro   && { description: intro }),
          ...(product.cover_url && { images: [product.cover_url] }),
        },
        unit_amount: Math.round(product.price_usd * 100),
      },
      quantity: 1,
    }],
    ...(user?.email && { customer_email: user.email }),
    metadata: {
      product_id:   product.id,
      user_id:      user?.id ?? '',
      product_slug: slug,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/academy`,
  });

  return Response.json({ url: session.url });
}
