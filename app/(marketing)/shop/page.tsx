import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Books, courses, and resources from Flom Digital, built for serious business builders.',
};

const PRODUCTS = [
  {
    Icon: BookOpen,
    badge: 'Digital Download',
    title: 'Mini Importation Mastery Guide',
    desc: '22 chapters walking you through every stage of the importation business, from sourcing to your first sale.',
    href: '#',
    iconColor: 'var(--fd-orange)',
  },
  {
    Icon: GraduationCap,
    badge: 'Course',
    title: 'Importation Mastery Course',
    desc: 'Video lessons, live Q&As, real supplier contacts, and a community. The complete importation education.',
    href: '#',
    iconColor: '#3B82F6',
  },
  {
    Icon: Zap,
    badge: 'Coming Soon',
    title: 'More Resources',
    desc: 'Templates, trackers, supplier lists, and more business tools are on the way. Join the mailing list to be first.',
    href: '/contact',
    iconColor: '#16a34a',
  },
];

export default function ShopPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '72px 0 56px' }}>
        <div className="fd-container">
          <div className="fd-section-label">Shop</div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-.025em', margin: '12px 0 16px' }}>
            Invest in your business education
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.7)', maxWidth: 500, lineHeight: 1.7, margin: '0 0 28px' }}>
            Every product here is designed to give you a real, practical advantage as a business builder.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/shop/flash-sale"   className="fd-btn fd-btn-primary fd-btn-sm">Flash Sale <Zap size={14} /></Link>
            <Link href="/shop/new-arrivals" className="fd-btn fd-btn-outline-white fd-btn-sm">New Arrivals</Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-products-grid">
            {PRODUCTS.map(({ Icon, badge, title, desc, href, iconColor }) => (
              <div key={title} className="fd-product-card">
                <div className="fd-product-img">
                  <Icon size={48} color={iconColor} />
                  <span className="fd-product-badge">{badge}</span>
                </div>
                <div className="fd-product-body">
                  <h2 className="fd-product-title">{title}</h2>
                  <p className="fd-product-desc">{desc}</p>
                  <div className="fd-product-price" style={{ color: 'var(--fd-muted)', fontSize: 14 }}>
                    Pricing announced soon
                  </div>
                  <Link href={href} className="fd-btn fd-btn-outline fd-btn-sm">
                    Learn More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
