import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, BookOpen, Video, FileText, Layers } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Practical importation education and business courses from Flom Digital.',
};

const PROMISES = [
  { Icon: BookOpen, text: 'Practical, not theoretical' },
  { Icon: CheckCircle, text: 'Africa-focused strategies' },
  { Icon: Layers, text: 'Step-by-step frameworks' },
  { Icon: CheckCircle, text: 'Lifetime access' },
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
      {/* ── Hero: editorial, full-width with bottom feature strip ── */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Diagonal accent block */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '38%',
          background: 'rgba(249,115,22,.05)',
          clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)',
          pointerEvents: 'none',
        }} />
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px)',
          backgroundSize: '100% 64px',
          pointerEvents: 'none',
        }} />

        <div className="fd-container" style={{ position: 'relative', padding: '80px 24px 64px' }}>
          <span className="fd-hero-eyebrow">Flom Academy</span>
          <h1 style={{ fontSize: 'clamp(32px,5vw,58px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.03em', margin: '16px 0 22px', maxWidth: 660 }}>
            Learn the business<br />of importation.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.68)', maxWidth: 520, lineHeight: 1.75, margin: '0 0 40px' }}>
            Courses and guides built for Nigerian and African entrepreneurs — real,
            actionable knowledge you can apply from day one.
          </p>
          <div className="fd-hero-ctas">
            <a href="#products" className="fd-btn fd-btn-primary">Browse products <ArrowRight size={16} /></a>
            <Link href="/resources" className="fd-btn fd-btn-outline-white">Free resources</Link>
          </div>
        </div>

        {/* Feature strip pinned to hero bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', background: 'rgba(0,0,0,.25)' }}>
          <div className="fd-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {PROMISES.map(({ Icon, text }, i) => (
              <div key={text} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '18px 24px',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,.07)' : 'none',
              }}>
                <Icon size={15} color="var(--fd-orange)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
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
