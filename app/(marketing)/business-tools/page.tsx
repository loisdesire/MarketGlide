import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Truck, FileText, Receipt, DollarSign,
  LayoutDashboard, ArrowRight,
} from 'lucide-react';
import TrustBadgeRow from '@/components/marketing/TrustBadgeRow';

export const metadata: Metadata = {
  title: 'Business Tools',
  description: 'Business tools for serious builders: Landed Cost Calculator, Invoice Generator, Receipt Generator, Currency Converter, and more.',
};

const TOOLS = [
  {
    Icon: LayoutDashboard,
    title: 'Sales & Inventory Tracker',
    desc: 'Full-featured tracker for products, sales, purchases, customers, and reports. Multi-user and multi-currency.',
    href: '/tracker/login',
    badge: 'Pro',
    badgeCls: '',
  },
  {
    Icon: Truck,
    title: 'Landed Cost Calculator',
    desc: 'Full landed cost tool: chargeable weight, freight, customs and duty, total landed cost, profit margin. 36 currencies.',
    href: '/business-tools/shipping-calculator',
    badge: '',
    badgeCls: '',
  },
  {
    Icon: FileText,
    title: 'Invoice Generator',
    desc: 'Create professional invoices with your branding, line items, taxes, and discounts. Print or save as PDF.',
    href: '/business-tools/invoice-generator',
    badge: '',
    badgeCls: '',
  },
  {
    Icon: Receipt,
    title: 'Receipt Generator',
    desc: 'Generate clean point-of-sale receipts in seconds. Perfect for market traders and retail businesses.',
    href: '/business-tools/receipt-generator',
    badge: '',
    badgeCls: '',
  },
  {
    Icon: DollarSign,
    title: 'Currency Converter',
    desc: 'Live exchange rates for USD, GBP, EUR, NGN, CNY, and more. Built for importers dealing in multiple currencies.',
    href: '/business-tools/currency-converter',
    badge: '',
    badgeCls: '',
  },
];

export default function BusinessToolsPage() {
  return (
    <>
      {/* Page hero */}
      <section className="fd-tool-page-hero">
        <div className="fd-container">
          <div className="fd-section-label">Business Tools</div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 12 }}>
            Tools to run your business
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fd-muted)', maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
            Everything a growing business needs, built by Flom Digital.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-tools-grid">
            {TOOLS.map(({ Icon, title, desc, href, badge, badgeCls }) => (
              <Link key={title} href={href} className="fd-tool-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="fd-tool-icon">
                    <Icon size={22} />
                  </div>
                  <h2 className="fd-tool-title" style={{ fontSize: 15 }}>
                    {title}
                    {badge && (
                      <span className={`fd-product-badge ${badgeCls}`} style={{ position: 'static', marginLeft: 4 }}>
                        {badge}
                      </span>
                    )}
                  </h2>
                </div>
                <p className="fd-tool-desc">{desc}</p>
                <span className="fd-tool-cta">
                  Open tool <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TrustBadgeRow />
    </>
  );
}
