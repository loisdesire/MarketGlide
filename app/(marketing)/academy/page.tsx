import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Zap } from 'lucide-react';
import BuyButton from '@/components/BuyButton';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Practical importation education and business courses from Flom Digital.',
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

export default async function AcademyPage() {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from('platform_products')
    .select('id,slug,title,description,type,price_usd,cover_url')
    .eq('is_active', true)
    .in('section', ['academy', 'both'])
    .order('sort_order', { ascending: true });

  const items: Product[] = products ?? [];

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '88px 0 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Crosshatch grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          pointerEvents: 'none',
        }} />

        <div className="fd-hero-inner" style={{ position: 'relative' }}>

          {/* Left */}
          <div>
            <span className="fd-hero-eyebrow">Flom Academy</span>
            <h1 className="fd-hero-headline">
              Learn the business<br />
              of importation.
            </h1>
            <p className="fd-hero-sub">
              Practical courses and guides built for Nigerian and African
              entrepreneurs. Real knowledge you can apply from day one.
            </p>
            <div className="fd-hero-ctas">
              <a href="#products" className="fd-btn fd-btn-primary">Browse products <ArrowRight size={16} /></a>
              <Link href="/resources" className="fd-btn fd-btn-outline-white">Free resources</Link>
            </div>
          </div>

          {/* Right — bento: lifetime spans rows 1+2 (left), 22+ + africa stack (right), practical full-width */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto auto', gap: 8 }}>

            {/* Col 1, rows 1+2 — dark glass, lifetime, 2/3 height, anchored to bottom */}
            <div style={{
              gridRow: '1 / 3', alignSelf: 'end',
              height: 136,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--fd-orange)', lineHeight: 1 }}>∞</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Lifetime access</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                  Buy once. Your content is there whenever you need it.
                </div>
              </div>
            </div>

            {/* Col 2, row 1 — orange glass: 22+ */}
            <div style={{
              background: 'rgba(249,115,22,.12)',
              border: '1px solid rgba(249,115,22,.25)',
              borderRadius: 14, padding: '20px',
            }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--fd-orange)', lineHeight: 1 }}>22+</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 8, lineHeight: 1.4 }}>
                In-depth chapters, zero filler
              </div>
            </div>

            {/* Col 2, row 2 — dark glass: Africa-first */}
            <div style={{
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(249,115,22,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPin size={18} color="var(--fd-orange)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Africa-first</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>Nigeria · Ghana · Kenya</div>
              </div>
            </div>

            {/* Row 3, full width — orange glass: practical */}
            <div style={{
              gridColumn: '1 / 3',
              background: 'rgba(249,115,22,.12)',
              border: '1px solid rgba(249,115,22,.25)',
              borderRadius: 14, padding: '16px 22px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: 'rgba(249,115,22,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={17} color="var(--fd-orange)" fill="var(--fd-orange)" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Practical, not theoretical</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
                  Built by someone who actually runs an importation business
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="products" className="fd-section">
        <div className="fd-container">
          <div className="fd-section-label">Available Now</div>
          <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 36 }}>Courses &amp; guides</h2>

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
                          ? <Link href={`/academy/${p.slug}`} className="fd-btn fd-btn-primary fd-btn-sm">Get free <ArrowRight size={13} /></Link>
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

      {/* ── Coming soon ── */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <div className="fd-section-label">Coming Soon</div>
          <h2 className="fd-section-title">More courses on the way</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Business startup guides, marketing strategy, AI for business, and financial literacy courses are in development.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="fd-btn fd-btn-primary">Join the waiting list <ArrowRight size={14} /></Link>
            <Link href="/blog" className="fd-btn fd-btn-outline">Read free articles</Link>
          </div>
        </div>
      </section>

      {/* ── Tools CTA ── */}
      <section className="fd-section">
        <div className="fd-container">
          <div style={{ background: 'var(--fd-navy)', borderRadius: 16, padding: '48px 40px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Use our business tools for free</h3>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, margin: 0, lineHeight: 1.7, maxWidth: 400 }}>
                Landed Cost Calculator, Invoice Generator, and Currency Converter — available right now.
              </p>
            </div>
            <Link href="/business-tools" className="fd-btn fd-btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Explore Tools <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
