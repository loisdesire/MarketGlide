import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Truck, FileText, Receipt, DollarSign, LayoutDashboard, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Tools',
  description: 'Business tools from Flom Digital: Landed Cost Calculator, Invoice Generator, Currency Converter, and more.',
};

const TOOL_LIST = [
  { Icon: LayoutDashboard, name: 'Sales & Inventory Tracker', price: '$20', color: '#16a34a' },
  { Icon: Truck,           name: 'Landed Cost Calculator',    price: '$20', color: '#ea580c' },
  { Icon: FileText,        name: 'Invoice Generator',         price: '$5',  color: '#3B82F6' },
  { Icon: Receipt,         name: 'Receipt Generator',         price: '$5',  color: '#7c3aed' },
  { Icon: DollarSign,      name: 'Currency Converter',        price: 'Free', color: '#16a34a' },
];

const TOOLS = [
  {
    type: 'Pro App',
    cover: 'linear-gradient(150deg,#064e3b 0%,#0f172a 60%,#1a2e22 100%)',
    title: 'Sales & Inventory Tracker',
    desc: 'Full-featured business tracker: manage products, sales, purchases, customers, invoices, and reports. Multi-user and multi-currency.',
    href: '/tracker/login',
    price: '$20', badgeLabel: 'Pro', badgeColor: '#7c3aed',
    features: ['Multi-user', 'Multi-currency', 'Invoices & reports', 'Inventory tracking'],
  },
  {
    type: 'Paid Tool',
    cover: 'linear-gradient(150deg,#7c2d12 0%,#ea580c 55%,#431407 100%)',
    title: 'Landed Cost Calculator',
    desc: 'Full landed cost tool with chargeable weight, freight, customs and duty, total landed cost, and profit margin. Supports 36 currencies.',
    href: '/business-tools/shipping-calculator',
    price: '$20', badgeLabel: '$20', badgeColor: '#ea580c',
    features: ['Chargeable weight', 'Duty & customs', 'Profit margin', '36 currencies'],
  },
  {
    type: 'Paid Tool',
    cover: 'linear-gradient(150deg,#1d3060 0%,#3B82F6 55%,#1e293b 100%)',
    title: 'Invoice Generator',
    desc: 'Create professional invoices with your branding, line items, taxes, and discounts. Print directly or save as PDF.',
    href: '/business-tools/invoice-generator',
    price: '$5', badgeLabel: '$5', badgeColor: '#3B82F6',
    features: ['Custom branding', 'Line items & taxes', 'PDF export', 'Print-ready'],
  },
  {
    type: 'Paid Tool',
    cover: 'linear-gradient(150deg,#2d1b69 0%,#7c3aed 55%,#1e1b4b 100%)',
    title: 'Receipt Generator',
    desc: 'Generate clean point-of-sale receipts in seconds. Perfect for market traders, retail businesses, and pop-up shops.',
    href: '/business-tools/receipt-generator',
    price: '$5', badgeLabel: '$5', badgeColor: '#7c3aed',
    features: ['POS-style receipts', 'Custom business name', 'Instant print', 'Zero setup'],
  },
  {
    type: 'Free Tool',
    cover: 'linear-gradient(150deg,#064e3b 0%,#0f7a5a 55%,#022c22 100%)',
    title: 'Currency Converter',
    desc: 'Live exchange rates for USD, GBP, EUR, NGN, CNY, and more. Built for importers dealing in multiple currencies daily.',
    href: '/business-tools/currency-converter',
    price: 'Free', badgeLabel: 'Free', badgeColor: '#16a34a',
    features: ['Live rates', 'USD · GBP · EUR', 'NGN · CNY · GHS', 'No sign-up needed'],
  },
];

export default function BusinessToolsPage() {
  return (
    <>
      {/* ── Hero: dot-grid pattern, right side = tool price list ── */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px', position: 'relative', overflow: 'hidden' }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        <div className="fd-container fd-tools-hero-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <span className="fd-hero-eyebrow">Business Tools</span>
            <h1 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.03em', margin: '16px 0 22px' }}>
              Tools to run<br /><span style={{ color: 'var(--fd-orange)' }}>your business.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.68)', maxWidth: 480, lineHeight: 1.75, margin: '0 0 40px' }}>
              Calculators, invoicing, receipts, currency conversion, and a full inventory tracker.
              Pay once, use forever — starting from just $5.
            </p>
            <div className="fd-hero-ctas">
              <a href="#tools" className="fd-btn fd-btn-primary">Explore tools <ArrowRight size={16} /></a>
              <Link href="/academy" className="fd-btn fd-btn-outline-white">View Academy</Link>
            </div>
          </div>

          {/* Right: tool price list */}
          <div style={{
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 14, padding: '8px 0', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--fd-orange)' }}>Pricing at a glance</span>
            </div>
            {TOOL_LIST.map(({ Icon, name, price, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={color} />
                </div>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.3 }}>{name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: price === 'Free' ? '#4ade80' : 'var(--fd-orange)', flexShrink: 0 }}>{price}</span>
              </div>
            ))}
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
                    <span className="fd-product-cover-badge" style={{ background: t.badgeColor }}>{t.badgeLabel}</span>
                  </div>
                  <div className="fd-product-body">
                    <h3 className="fd-product-title">{t.title}</h3>
                    <p style={{ fontSize: 13.5, color: 'var(--fd-muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '43px' }}>
                      {t.desc}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0 0' }}>
                      {t.features.map(f => (
                        <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fd-muted)', background: 'var(--fd-bg-alt)', border: '1px solid var(--fd-border)', borderRadius: 5, padding: '3px 8px' }}>
                          <CheckCircle size={10} color="var(--fd-orange)" />{f}
                        </span>
                      ))}
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: t.price === 'Free' ? '#16a34a' : 'var(--fd-navy)' }}>{t.price}</span>
                      <span className="fd-btn fd-btn-primary fd-btn-sm" style={{ pointerEvents: 'none' }}>Open tool <ArrowRight size={13} /></span>
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
              <h3 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Learn how to use these tools properly</h3>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, margin: 0, lineHeight: 1.7, maxWidth: 400 }}>
                The Academy teaches you the importation strategies that make these tools most effective.
              </p>
            </div>
            <Link href="/academy" className="fd-btn fd-btn-primary" style={{ whiteSpace: 'nowrap' }}>Visit Academy <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
