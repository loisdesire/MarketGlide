import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, CheckCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Practical importation education and business courses from Flom Digital. Learn to import, sell, and profit.',
};

const PRODUCTS = [
  {
    Icon:      GraduationCap,
    badge:     'Course',
    badgeColor: '#3B82F6',
    title:     'Mini Importation Mastery Course',
    desc:      'The complete video-based training on building a profitable importation business from scratch. Covers sourcing, shipping, customs, pricing, and your first sale.',
    price:     '$20',
    features:  ['Video lessons', 'Live Q&A sessions', 'Real supplier contacts', 'Private community access'],
    href:      '/academy/mini-importation-course',
    cta:       'Enroll Now',
  },
  {
    Icon:      BookOpen,
    badge:     'eBook',
    badgeColor: 'var(--fd-orange)',
    title:     'Mini Importation Mastery Guide',
    desc:      '22 chapters walking you through every stage of the importation business, from identifying products to making your first sale. Read at your own pace.',
    price:     '$30',
    features:  ['22 in-depth chapters', 'Supplier evaluation framework', 'Pricing and profit templates', 'Instant digital download'],
    href:      '/academy/mini-importation-guide',
    cta:       'Get the Guide',
  },
];

const WHY = [
  'Practical, not theoretical — built by someone who actually does this',
  'Nigeria and Africa-focused importation strategies',
  'Step-by-step frameworks you can apply immediately',
  'Lifetime access to all purchased content',
];

export default function AcademyPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)' }}>Flom Academy</div>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 640 }}>
            Learn the business of importation
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 520, lineHeight: 1.75, margin: '0 0 32px' }}>
            Courses and guides built for Nigerian and African entrepreneurs who want real, actionable knowledge on importation, trade, and business growth.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#courses" className="fd-btn fd-btn-primary">Browse Courses <ArrowRight size={14} /></a>
            <Link href="/resources" className="fd-btn fd-btn-outline-white">Free Resources</Link>
          </div>
        </div>
      </section>

      {/* Why learn here */}
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '40px 0' }}>
        <div className="fd-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {WHY.map(point => (
              <div key={point} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckCircle size={17} color="var(--fd-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: 'var(--fd-navy)', lineHeight: 1.6 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="fd-section">
        <div className="fd-container">
          <div className="fd-section-label">Available Now</div>
          <h2 className="fd-section-title">Courses and guides</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 520, margin: '0 auto 48px', textAlign: 'center', lineHeight: 1.7 }}>
            Each product is designed to give you a concrete, practised advantage as an importation business owner.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, maxWidth: 780, margin: '0 auto' }}>
            {PRODUCTS.map(({ Icon, badge, badgeColor, title, desc, price, features, href, cta }) => (
              <div key={title} className="fd-product-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="fd-product-img" style={{ justifyContent: 'center', gap: 12 }}>
                  <Icon size={52} color={badgeColor} />
                  <span className="fd-product-badge" style={{ background: badgeColor }}>{badge}</span>
                </div>
                <div className="fd-product-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 className="fd-product-title">{title}</h2>
                  <p className="fd-product-desc">{desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 20px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--fd-muted)' }}>
                        <CheckCircle size={13} color="var(--fd-orange)" style={{ flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--fd-navy)', marginBottom: 14 }}>{price}</div>
                    <Link href={href} className="fd-btn fd-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      {cta} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
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

      {/* Business tools CTA */}
      <section className="fd-section">
        <div className="fd-container">
          <div style={{ background: 'var(--fd-navy)', borderRadius: 16, padding: '48px 40px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={16} color="var(--fd-orange)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fd-orange)', textTransform: 'uppercase', letterSpacing: '.08em' }}>While you learn</span>
              </div>
              <h3 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
                Use our business tools for free
              </h3>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, margin: 0, lineHeight: 1.7, maxWidth: 400 }}>
                The Landed Cost Calculator, Invoice Generator, and Currency Converter are available to use right now.
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
