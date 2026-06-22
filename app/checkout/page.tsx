'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Clock, Mail, ArrowLeft } from 'lucide-react';

type Product = { title: string; price_usd: number; type: string };

function CheckoutContent() {
  const params   = useSearchParams();
  const slug     = params.get('product') ?? '';
  const supabase = createClient();

  const [product,   setProduct]   = useState<Product | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: { user } }] = await Promise.all([
        supabase.from('platform_products').select('title, price_usd, type').eq('slug', slug).maybeSingle(),
        supabase.auth.getUser(),
      ]);
      setProduct(p ?? null);
      setUserEmail(user?.email ?? '');
    })();
  }, [slug]);

  return (
    <>
      <Link href="/" style={{ marginBottom: 28, textDecoration: 'none' }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--fd-navy)', letterSpacing: '-.04em' }}>
          flom<span style={{ color: 'var(--fd-orange)' }}>digital</span>
        </span>
      </Link>

      <div style={{
        background: '#fff',
        border: '1.5px solid var(--fd-border)',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 4px 24px rgba(0,0,0,.06)',
        textAlign: 'center',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Clock size={26} color="var(--fd-orange)" />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fd-navy)', margin: '0 0 10px', letterSpacing: '-.03em' }}>
          Payment coming soon
        </h1>

        {product && (
          <div style={{ background: 'var(--fd-bg-alt)', borderRadius: 10, padding: '12px 16px', margin: '0 0 18px', fontSize: 14, color: 'var(--fd-navy)' }}>
            <div style={{ fontWeight: 700 }}>{product.title}</div>
            <div style={{ color: 'var(--fd-orange)', fontWeight: 800, fontSize: 18, marginTop: 4 }}>${product.price_usd}</div>
          </div>
        )}

        <p style={{ fontSize: 14, color: 'var(--fd-muted)', lineHeight: 1.7, margin: '0 0 24px' }}>
          We&apos;re setting up secure card payment and it&apos;ll be live very soon.
          {userEmail && <> Your account (<strong>{userEmail}</strong>) is ready — you&apos;ll have instant access the moment you pay.</>}
        </p>

        <a
          href="mailto:hello@flomdigital.com"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--fd-navy)', color: '#fff', fontWeight: 700,
            fontSize: 14, padding: '12px 22px', borderRadius: 10,
            textDecoration: 'none', marginBottom: 16,
          }}
        >
          <Mail size={15} /> Reach out to complete payment
        </a>

        <div style={{ fontSize: 12, color: 'var(--fd-muted)', marginBottom: 8 }}>
          We typically respond within a few hours.
        </div>

        <Link href={slug ? `/academy/${slug}` : '/academy'}
          style={{ fontSize: 13, color: 'var(--fd-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginTop: 8 }}>
          <ArrowLeft size={13} /> Back to product
        </Link>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ height: 60, width: 300, background: '#f3f4f6', borderRadius: 12, animation: 'pulse 1.5s ease infinite' }} />
    }>
      <CheckoutContent />
    </Suspense>
  );
}
