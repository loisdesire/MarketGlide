import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'New Arrivals' };

export default function NewArrivalsPage() {
  return (
    <>
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '64px 0 48px' }}>
        <div className="fd-container">
          <div className="fd-section-label">New Arrivals</div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 12 }}>What's new at Flom Digital</h1>
          <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: 0, lineHeight: 1.7 }}>
            Fresh courses, guides, and tools, added regularly.
          </p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-coming-soon">
            <Package size={48} color="var(--fd-orange)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2>New products on the way</h2>
            <p>We're building something great. <Link href="/contact" style={{ color: 'var(--fd-orange)', fontWeight: 600 }}>Join our mailing list</Link> to be notified first.</p>
            <Link href="/shop" className="fd-btn fd-btn-primary fd-btn-sm" style={{ marginTop: 20, display: 'inline-flex' }}>
              See All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
