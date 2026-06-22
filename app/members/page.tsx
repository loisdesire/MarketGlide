'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, FileText, ShoppingBag, ExternalLink, Lock, LogOut, CheckCircle2 } from 'lucide-react';

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  price_usd: number;
  cover_url: string;
  file_url: string;
};

type AuthUser = { id: string; email: string | undefined; user_metadata: { full_name?: string } };

const TYPE_ICON: Record<string, React.ReactNode> = {
  course:      <BookOpen   size={14} />,
  guide:       <FileText   size={14} />,
  template:    <FileText   size={14} />,
  bundle:      <ShoppingBag size={14} />,
  tool_access: <ExternalLink size={14} />,
};

function fmt(usd: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(usd);
}

export default function MembersPage() {
  const supabase = createClient();

  const [user,        setUser]        = useState<AuthUser | null>(null);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [ownedIds,    setOwnedIds]    = useState<Set<string>>(new Set());
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/login'; return; }
      setUser(u as AuthUser);

      // Load all active products + this user's purchases in parallel
      const [productsRes, purchasesRes] = await Promise.all([
        supabase
          .from('platform_products')
          .select('id, slug, title, description, type, price_usd, cover_url, file_url')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('user_purchases')
          .select('product_id')
          .eq('user_id', u.id),
      ]);

      setProducts(productsRes.data ?? []);
      setOwnedIds(new Set((purchasesRes.data ?? []).map(p => p.product_id)));
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there';

  const owned     = products.filter(p => ownedIds.has(p.id));
  const available = products.filter(p => !ownedIds.has(p.id));

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--fd-navy)', letterSpacing: '-.04em' }}>
            flom<span style={{ color: 'var(--fd-orange)' }}>digital</span>
          </span>
        </Link>
        <button
          onClick={signOut}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fd-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--fd-navy)', margin: '0 0 4px', letterSpacing: '-.03em' }}>
        Welcome back, {firstName}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fd-muted)', margin: '0 0 40px' }}>
        Browse your library or discover new courses and guides below.
      </p>

      {loading ? (
        <p style={{ color: 'var(--fd-muted)', fontSize: 14 }}>Loading…</p>
      ) : (
        <>
          {/* ── Owned ── */}
          {owned.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={15} color="#16a34a" /> Your library
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {owned.map(p => <ProductCard key={p.id} product={p} owned />)}
              </div>
            </section>
          )}

          {/* ── Available ── */}
          {available.length > 0 && (
            <section>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 16px' }}>
                {owned.length > 0 ? 'Available to buy' : 'Available courses & guides'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {available.map(p => <ProductCard key={p.id} product={p} owned={false} />)}
              </div>
            </section>
          )}

          {products.length === 0 && (
            <div style={{ background: '#fff', border: '1.5px solid var(--fd-border)', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
              <ShoppingBag size={40} color="#e5e7eb" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: 0 }}>
                No products available yet — check back soon.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductCard({ product: p, owned }: { product: Product; owned: boolean }) {
  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${owned ? '#bbf7d0' : 'var(--fd-border)'}`,
      borderRadius: 14,
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
    }}>
      {/* Cover */}
      {p.cover_url ? (
        <img src={p.cover_url} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 60, height: 60, borderRadius: 10, background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          {TYPE_ICON[p.type] ?? <FileText size={20} />}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
            {TYPE_ICON[p.type]} {p.type.replace('_', ' ')}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fd-navy)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.title}
        </div>
        {p.description && (
          <div style={{ fontSize: 12, color: 'var(--fd-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.description}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {owned ? (
          p.file_url ? (
            <a
              href={p.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13,
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
              }}
            >
              {p.type === 'course' ? 'Watch' : 'Download'} <ExternalLink size={12} />
            </a>
          ) : (
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} /> Owned
            </span>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--fd-navy)' }}>
              {p.price_usd === 0 ? 'Free' : fmt(p.price_usd)}
            </span>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--fd-orange)', color: '#fff', fontWeight: 700, fontSize: 13,
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              }}
              onClick={() => alert('Payment coming soon — we\'ll email you when it\'s live.')}
            >
              <Lock size={12} /> Get access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
