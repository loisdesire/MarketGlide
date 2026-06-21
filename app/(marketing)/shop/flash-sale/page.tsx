import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Flash Sale' };

export default function FlashSalePage() {
  return (
    <>
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '64px 0 48px' }}>
        <div className="fd-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Zap size={20} color="var(--fd-orange)" />
            <div className="fd-section-label" style={{ margin: 0, color: 'var(--fd-orange)' }}>Flash Sale</div>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-.025em', margin: '0 0 14px' }}>
            Limited-time offers
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', maxWidth: 440, lineHeight: 1.7, margin: 0 }}>
            Grab our best products at discounted prices, for a limited time only.
          </p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-coming-soon">
            <Zap size={48} color="var(--fd-orange)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2>No active flash sales right now</h2>
            <p>Check back soon or <Link href="/contact" style={{ color: 'var(--fd-orange)', fontWeight: 600 }}>subscribe to alerts</Link> so you're first to know.</p>
            <Link href="/shop" className="fd-btn fd-btn-outline fd-btn-sm" style={{ marginTop: 20, display: 'inline-flex' }}>
              Browse All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
