import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Layers } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Practical importation education and business courses from Flom Digital.',
};

const CURRICULUM = [
  'Identifying winning products to import',
  'Finding & vetting verified suppliers',
  'Shipping terms, freight & logistics',
  'Customs, duties & landing costs',
  'Pricing strategies for maximum profit',
  'Your first sale — start to finish',
];

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
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 72px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle horizontal rule texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '100% 56px',
          pointerEvents: 'none',
        }} />

        <div className="fd-hero-inner" style={{ position: 'relative' }}>
          {/* Left — headline + CTAs */}
          <div>
            <span className="fd-hero-eyebrow">Flom Academy</span>
            <h1 className="fd-hero-headline">
              Learn the business<br />
              <span className="accent">of importation.</span>
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

          {/* Right — course outline card (white on dark, no gradient) */}
          <div style={{
            background: '#fff', borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,.35)',
          }}>
            {/* Card header */}
            <div style={{
              background: 'var(--fd-navy)', borderBottom: '3px solid var(--fd-orange)',
              padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--fd-orange)' }}>
                Course outline
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>
                22+ chapters
              </span>
            </div>

            {/* Chapter list */}
            <div style={{ padding: '8px 0' }}>
              {CURRICULUM.map((topic, i) => (
                <div key={topic} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  padding: '11px 24px',
                  borderBottom: i < CURRICULUM.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: i < 2 ? 'var(--fd-orange)' : '#fff7ed',
                    color: i < 2 ? '#fff' : 'var(--fd-orange)',
                    fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 13.5, color: 'var(--fd-text)', lineHeight: 1.4, fontWeight: i < 2 ? 600 : 400 }}>
                    {topic}
                  </span>
                  {i < 2 && (
                    <CheckCircle size={14} color="var(--fd-orange)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Card footer */}
            <div style={{
              background: '#f8fafc', borderTop: '1px solid #e2e8f0',
              padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Layers size={13} color="var(--fd-muted)" />
                <span style={{ fontSize: 12, color: 'var(--fd-muted)' }}>+ 16 more chapters</span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                {[['22+', 'Chapters'], ['∞', 'Access']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--fd-navy)', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--fd-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>{l}</div>
                  </div>
                ))}
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
                  <Link key={p.id} href={`/academy/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="fd-product-card">
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
                          <Link href={`/academy/${p.slug}`} className="fd-btn fd-btn-primary fd-btn-sm">
                            View details <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Link>
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
