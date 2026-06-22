import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import BuyButton from '@/components/BuyButton';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Books, courses, and resources from Flom Digital, built for serious business builders.',
};

const TYPE_COLORS: Record<string, string> = {
  course:      'linear-gradient(150deg,#1d3060 0%,#3B82F6 55%,#1e293b 100%)',
  video:       'linear-gradient(150deg,#1d3060 0%,#3B82F6 55%,#1e293b 100%)',
  ebook:       'linear-gradient(150deg,#0F172A 0%,#1e3660 55%,#0F172A 100%)',
  guide:       'linear-gradient(150deg,#0F172A 0%,#1e3660 55%,#0F172A 100%)',
  template:    'linear-gradient(150deg,#2d1b69 0%,#7c3aed 55%,#1e1b4b 100%)',
  bundle:      'linear-gradient(150deg,#064e3b 0%,#0f172a 60%,#1a2e22 100%)',
  tool_access: 'linear-gradient(150deg,#0c4a6e 0%,#0369a1 55%,#0f172a 100%)',
};

const TYPE_LABEL: Record<string, string> = {
  course: 'Course', video: 'Video Course', ebook: 'eBook',
  guide: 'Guide', template: 'Template', bundle: 'Bundle', tool_access: 'Tool Access',
};

type Product = {
  id: string; slug: string; title: string; description: string;
  type: string; price_usd: number; cover_url: string;
};

export default async function ShopPage() {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from('platform_products')
    .select('id,slug,title,description,type,price_usd,cover_url')
    .eq('is_active', true)
    .in('section', ['shop', 'both'])
    .order('sort_order', { ascending: true });

  const items: Product[] = products ?? [];

  return (
    <>
      {/* ── Hero: deep indigo, centered, premium marketplace feel ── */}
      <section style={{
        background: '#0b0915',
        color: '#fff', padding: '88px 0 72px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Purple radial glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(139,92,246,.22) 0%,transparent 62%)',
          pointerEvents: 'none',
        }} />
        {/* Subtle dot texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }} />

        <div className="fd-container" style={{ position: 'relative' }}>
          <span className="fd-hero-eyebrow">Flom Shop</span>
          <h1 style={{ fontSize: 'clamp(32px,5vw,58px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.03em', margin: '16px auto 22px', maxWidth: 600 }}>
            Invest in your<br /><span style={{ color: 'var(--fd-orange)' }}>business education.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.68)', maxWidth: 480, lineHeight: 1.75, margin: '0 auto 40px' }}>
            Every product is designed to give you a real, practical advantage. No fluff — just what works.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#products" className="fd-btn fd-btn-primary">Shop now <ArrowRight size={16} /></a>
            <Link href="/academy" className="fd-btn fd-btn-outline-white">View Academy</Link>
          </div>

          {/* Inline stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 56 }}>
            {[
              { val: <Zap size={20} fill="#f97316" color="#f97316" />, lbl: 'Instant delivery' },
              { val: '∞',   lbl: 'Lifetime access' },
              { val: '$20', lbl: 'From just' },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="products" className="fd-section">
        <div className="fd-container">
          <div className="fd-section-label">In Stock</div>
          <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 36 }}>All products</h2>

          {items.length === 0 ? (
            <p style={{ color: 'var(--fd-muted)', fontSize: 15 }}>Products coming soon — check back shortly.</p>
          ) : (
            <div className="fd-products-grid">
              {items.map(p => {
                const typeLabel = TYPE_LABEL[p.type] ?? p.type;
                const bg = TYPE_COLORS[p.type] ?? TYPE_COLORS.guide;
                const intro = (p.description ?? '').split('\n')[0];
                return (
                  <div key={p.id} className="fd-product-card">
                    <div className="fd-product-cover" style={{ background: p.cover_url ? undefined : bg, padding: 0 }}>
                      {p.cover_url ? <img src={p.cover_url} alt={p.title} /> : (
                        <>
                          <div className="fd-product-cover-accent" />
                          <div className="fd-product-cover-label">{typeLabel}</div>
                          <div className="fd-product-cover-title">{p.title}</div>
                        </>
                      )}
                      <span className="fd-product-cover-badge">{typeLabel}</span>
                    </div>
                    <div className="fd-product-body">
                      <h3 className="fd-product-title">{p.title}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--fd-muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '43px' }}>
                        {intro}
                      </p>
                      <div style={{ flex: 1 }} />
                      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="fd-product-price" style={{ margin: 0 }}>
                          {p.price_usd === 0 ? 'Free' : `$${p.price_usd}`}
                        </span>
                        {p.price_usd === 0
                          ? <Link href={`/shop/${p.slug}`} className="fd-btn fd-btn-primary fd-btn-sm">Get free <ArrowRight size={13} /></Link>
                          : <BuyButton slug={p.slug} />
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <div className="fd-section-label">Coming Soon</div>
          <h2 className="fd-section-title">More products on the way</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Templates, supplier lists, trackers, and more are being added regularly.
          </p>
          <Link href="/contact" className="fd-btn fd-btn-primary">Get notified <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  );
}
