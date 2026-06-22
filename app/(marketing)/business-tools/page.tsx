import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Wrench, CheckCircle, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Tools',
  description: 'Business tools from Flom Digital: Landed Cost Calculator, Invoice Generator, Currency Converter, and more.',
};

const TOOLS = [
  {
    type:  'Pro App',
    cover: 'linear-gradient(150deg,#064e3b 0%,#0f172a 60%,#1a2e22 100%)',
    title: 'Sales & Inventory Tracker',
    desc:  'Full-featured business tracker: manage products, sales, purchases, customers, invoices, and reports. Multi-user and multi-currency.',
    href:  '/tracker/login',
    price: '$20',
    badgeLabel: 'Pro',
    badgeColor: '#7c3aed',
    features: ['Multi-user', 'Multi-currency', 'Invoices & reports', 'Inventory tracking'],
  },
  {
    type:  'Paid Tool',
    cover: 'linear-gradient(150deg,#7c2d12 0%,#ea580c 55%,#431407 100%)',
    title: 'Landed Cost Calculator',
    desc:  'Full landed cost tool with chargeable weight, freight, customs and duty, total landed cost, and profit margin. Supports 36 currencies.',
    href:  '/business-tools/shipping-calculator',
    price: '$20',
    badgeLabel: '$20',
    badgeColor: '#ea580c',
    features: ['Chargeable weight', 'Duty & customs', 'Profit margin', '36 currencies'],
  },
  {
    type:  'Paid Tool',
    cover: 'linear-gradient(150deg,#1d3060 0%,#3B82F6 55%,#1e293b 100%)',
    title: 'Invoice Generator',
    desc:  'Create professional invoices with your branding, line items, taxes, and discounts. Print directly or save as PDF.',
    href:  '/business-tools/invoice-generator',
    price: '$5',
    badgeLabel: '$5',
    badgeColor: '#3B82F6',
    features: ['Custom branding', 'Line items & taxes', 'PDF export', 'Print-ready'],
  },
  {
    type:  'Paid Tool',
    cover: 'linear-gradient(150deg,#2d1b69 0%,#7c3aed 55%,#1e1b4b 100%)',
    title: 'Receipt Generator',
    desc:  'Generate clean point-of-sale receipts in seconds. Perfect for market traders, retail businesses, and pop-up shops.',
    href:  '/business-tools/receipt-generator',
    price: '$5',
    badgeLabel: '$5',
    badgeColor: '#7c3aed',
    features: ['POS-style receipts', 'Custom business name', 'Instant print', 'Zero setup'],
  },
  {
    type:  'Free Tool',
    cover: 'linear-gradient(150deg,#064e3b 0%,#0f7a5a 55%,#022c22 100%)',
    title: 'Currency Converter',
    desc:  'Live exchange rates for USD, GBP, EUR, NGN, CNY, and more. Built for importers dealing in multiple currencies daily.',
    href:  '/business-tools/currency-converter',
    price: 'Free',
    badgeLabel: 'Free',
    badgeColor: '#16a34a',
    features: ['Live rates', 'USD · GBP · EUR', 'NGN · CNY · GHS', 'No sign-up needed'],
  },
];

export default function BusinessToolsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="fd-hero">
        <div className="fd-hero-inner">
          <div>
            <span className="fd-hero-eyebrow">Business Tools</span>
            <h1 className="fd-hero-headline">
              Tools to run<br />
              <span className="accent">your business.</span>
            </h1>
            <p className="fd-hero-sub">
              Calculators, invoicing, receipts, currency conversion, and a full inventory
              tracker. Pay once, use forever — starting from just $5.
            </p>
            <div className="fd-hero-ctas">
              <a href="#tools" className="fd-btn fd-btn-primary">Explore Tools <ArrowRight size={16} /></a>
              <Link href="/academy" className="fd-btn fd-btn-outline-white">View Academy</Link>
            </div>
          </div>

          <div className="fd-hero-visual">
            <div className="fd-hero-visual-inner">
              <div className="fd-hero-card">
                <div className="fd-hero-card-icon" style={{ background: '#ea580c' }}>
                  <Wrench size={20} color="#fff" />
                </div>
                <div>
                  <div className="fd-hero-card-title">Built for importers</div>
                  <div className="fd-hero-card-sub">Duty · freight · profit in one place</div>
                </div>
              </div>
              <div className="fd-hero-card">
                <div className="fd-hero-card-icon" style={{ background: '#16a34a' }}>
                  <DollarSign size={20} color="#fff" />
                </div>
                <div>
                  <div className="fd-hero-card-title">One-time payment</div>
                  <div className="fd-hero-card-sub">Pay once · access forever · from $5</div>
                </div>
              </div>
              <div className="fd-hero-stat-row">
                <div className="fd-hero-stat">
                  <div className="fd-hero-stat-val">5</div>
                  <div className="fd-hero-stat-lbl">Tools</div>
                </div>
                <div className="fd-hero-stat">
                  <div className="fd-hero-stat-val">$5</div>
                  <div className="fd-hero-stat-lbl">From</div>
                </div>
                <div className="fd-hero-stat">
                  <div className="fd-hero-stat-val">36</div>
                  <div className="fd-hero-stat-lbl">Currencies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section id="tools" className="fd-section">
        <div className="fd-container">
          <div className="fd-section-label">Available Now</div>
          <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 36 }}>All tools</h2>

          <div className="fd-products-grid">
            {TOOLS.map(t => (
              <Link key={t.title} href={t.href} style={{ textDecoration: 'none' }}>
                <div className="fd-product-card">
                  <div className="fd-product-cover" style={{ background: t.cover, padding: 0 }}>
                    <div className="fd-product-cover-accent" />
                    <div className="fd-product-cover-label">{t.type}</div>
                    <div className="fd-product-cover-title">{t.title}</div>
                    <span className="fd-product-cover-badge" style={{ background: t.badgeColor }}>
                      {t.badgeLabel}
                    </span>
                  </div>

                  <div className="fd-product-body">
                    <h3 className="fd-product-title">{t.title}</h3>
                    <p style={{
                      fontSize: 13.5,
                      color: 'var(--fd-muted)',
                      lineHeight: 1.6,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '43px',
                    }}>
                      {t.desc}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0 0' }}>
                      {t.features.map(f => (
                        <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fd-muted)', background: 'var(--fd-bg-alt)', border: '1px solid var(--fd-border)', borderRadius: 5, padding: '3px 8px' }}>
                          <CheckCircle size={10} color="var(--fd-orange)" />
                          {f}
                        </span>
                      ))}
                    </div>

                    <div style={{ flex: 1 }} />
                    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: t.price === 'Free' ? '#16a34a' : 'var(--fd-navy)',
                      }}>
                        {t.price}
                      </span>
                      <span className="fd-btn fd-btn-primary fd-btn-sm" style={{ pointerEvents: 'none' }}>
                        Open tool <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academy CTA ── */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container">
          <div style={{ background: 'var(--fd-navy)', borderRadius: 16, padding: '48px 40px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
                Learn how to use these tools properly
              </h3>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, margin: 0, lineHeight: 1.7, maxWidth: 400 }}>
                The Academy teaches you the importation strategies that make these tools most effective.
              </p>
            </div>
            <Link href="/academy" className="fd-btn fd-btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Visit Academy <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
