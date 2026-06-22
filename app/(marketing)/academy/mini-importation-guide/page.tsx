import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, BookOpen, Download, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mini Importation Mastery Guide',
  description: '22 chapters walking you through every stage of the importation business, from sourcing to your first sale.',
};

const CHAPTERS = [
  'Why mini importation is still the best low-capital business opportunity',
  'Choosing the right product category for your market',
  'How to find and evaluate suppliers on Alibaba, 1688, and Taobao',
  'Negotiating prices and minimum order quantities',
  'Understanding incoterms: FOB, EXW, CIF explained simply',
  'Calculating your full landed cost before you commit',
  'Air vs. sea freight — which is right for your shipment?',
  'Customs clearance in Nigeria: duties, HS codes, and what to expect',
  'Pricing for profit in the Nigerian market',
  'Setting up your sales channels: social media, Jumia, WhatsApp, etc.',
  '...and 12 more chapters covering operations, scaling, and more',
];

export default function MiniImportationGuidePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Link href="/academy" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Academy</Link>
            <span style={{ color: 'rgba(255,255,255,.3)' }}>/</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>eBook</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', background: 'var(--fd-orange)', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', borderRadius: 6, padding: '3px 10px', marginBottom: 16 }}>eBook</span>
              <h1 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-.03em', margin: '0 0 18px', lineHeight: 1.15 }}>
                Mini Importation Mastery Guide
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', lineHeight: 1.75, margin: '0 0 28px' }}>
                22 chapters covering every stage of the importation business. Written to be practical, specific to the Nigerian market, and useful from day one.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>$30</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Instant digital download</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                  <BookOpen size={14} /> 22 chapters
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                  <Clock size={14} /> Read at your own pace
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                  <Download size={14} /> Lifetime access
                </div>
              </div>
              <Link href="/contact" className="fd-btn fd-btn-primary" style={{ fontSize: 15, padding: '12px 24px' }}>
                Get the Guide — $30 <ArrowRight size={15} />
              </Link>
            </div>

            {/* Book visual */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 200, background: 'linear-gradient(135deg, var(--fd-orange) 0%, #c84b00 100%)', borderRadius: 12, padding: '32px 24px', boxShadow: '12px 12px 40px rgba(0,0,0,.5)', transform: 'perspective(600px) rotateY(-8deg)' }}>
                <BookOpen size={36} color="rgba(255,255,255,.9)" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>Mini Importation Mastery Guide</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>Flom Digital</div>
                <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: 14, fontSize: 11, color: 'rgba(255,255,255,.6)' }}>22 Chapters</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter list */}
      <section className="fd-section">
        <div className="fd-container" style={{ maxWidth: 700 }}>
          <div className="fd-section-label">Inside the guide</div>
          <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 28 }}>What's covered</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHAPTERS.map((chapter, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--fd-border)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fd-orange)', minWidth: 22, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 14, color: 'var(--fd-muted)', lineHeight: 1.65 }}>{chapter}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <h2 className="fd-section-title">Get your copy today</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Immediate download. Read on any device. Apply the knowledge to your first or next shipment.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="fd-btn fd-btn-primary">Get the Guide — $30 <ArrowRight size={14} /></Link>
            <Link href="/academy/mini-importation-course" className="fd-btn fd-btn-outline">Prefer the full course?</Link>
          </div>
        </div>
      </section>
    </>
  );
}
