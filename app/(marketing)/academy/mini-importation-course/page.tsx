import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, GraduationCap, Users, Video, MessageCircle } from 'lucide-react';
import ProductCTA from '@/components/ProductCTA';

export const metadata: Metadata = {
  title: 'Mini Importation Mastery Course',
  description: 'The complete video-based training on building a profitable importation business. Sourcing, shipping, customs, pricing, and your first sale.',
};

const INCLUDES = [
  { Icon: Video,          text: 'Full video lesson library' },
  { Icon: Users,          text: 'Private community access' },
  { Icon: MessageCircle,  text: 'Live Q&A sessions' },
  { Icon: GraduationCap,  text: 'Real supplier contacts' },
];

const OUTCOMES = [
  'Find profitable products to import from China and other markets',
  'Evaluate and negotiate with suppliers confidently',
  'Calculate your true landed cost before committing to any shipment',
  'Navigate customs clearance and avoid common costly mistakes',
  'Price your products for profit and position them in the Nigerian market',
  'Make your first sale and set up repeat orders',
];

export default function MiniImportationCoursePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Link href="/academy" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Academy</Link>
            <span style={{ color: 'rgba(255,255,255,.3)' }}>/</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Course</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', background: '#3B82F6', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', borderRadius: 6, padding: '3px 10px', marginBottom: 16 }}>Course</span>
              <h1 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-.03em', margin: '0 0 18px', lineHeight: 1.15 }}>
                Mini Importation Mastery Course
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', lineHeight: 1.75, margin: '0 0 28px' }}>
                The complete video-based training on building a profitable importation business from scratch — from finding the right products to making your first sale.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>$20</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>One-time payment, lifetime access</span>
              </div>
              <ProductCTA slug="mini-importation-course" label="Enroll Now" />
            </div>

            {/* Course includes */}
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: '28px 26px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 18px' }}>This course includes</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {INCLUDES.map(({ Icon, text }) => (
                  <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,107,0,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color="var(--fd-orange)" />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,.8)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="fd-section">
        <div className="fd-container" style={{ maxWidth: 740 }}>
          <div className="fd-section-label">Learning outcomes</div>
          <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 28 }}>What you will learn</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {OUTCOMES.map(outcome => (
              <div key={outcome} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="var(--fd-orange)" style={{ flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 14, color: 'var(--fd-muted)', lineHeight: 1.65 }}>{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <h2 className="fd-section-title">Ready to start importing?</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
            One payment. Lifetime access. Practical knowledge you can apply to your first shipment immediately.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <ProductCTA slug="mini-importation-course" label="Enroll Now" />
            <Link href="/academy/mini-importation-guide" className="fd-btn fd-btn-outline">Prefer the written guide?</Link>
          </div>
        </div>
      </section>
    </>
  );
}
