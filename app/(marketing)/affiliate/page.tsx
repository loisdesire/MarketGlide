import type { Metadata } from 'next';
import { ExternalLink, Wrench, Ship, Cpu, Megaphone, Globe, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affiliate Picks',
  description: 'Tools, platforms, and resources recommended by Flom Digital for business builders and importers.',
};

const SECTIONS = [
  {
    Icon:  Wrench,
    title: 'Recommended Business Tools',
    desc:  'Software and platforms we use and recommend for running day-to-day business operations.',
  },
  {
    Icon:  Ship,
    title: 'Importation Platforms',
    desc:  'Trusted sourcing, freight, and logistics platforms for the importation business.',
  },
  {
    Icon:  Cpu,
    title: 'AI Tools',
    desc:  'AI tools that genuinely help with content creation, automation, and business productivity.',
  },
  {
    Icon:  Megaphone,
    title: 'Marketing Software',
    desc:  'Email marketing, social media, and advertising tools for growing your customer base.',
  },
  {
    Icon:  Globe,
    title: 'Website Builders',
    desc:  'The best platforms for building business websites, landing pages, and online stores.',
  },
  {
    Icon:  DollarSign,
    title: 'Financial Platforms',
    desc:  'Payment processors, invoicing tools, and financial management platforms we trust.',
  },
];

export default function AffiliatePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)' }}>Affiliate Picks</div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 560 }}>
            Tools and platforms we actually use
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 500, lineHeight: 1.75, margin: 0 }}>
            Every recommendation here is something we have personally used or thoroughly evaluated. Some links are affiliate links — we earn a small commission at no extra cost to you.
          </p>
        </div>
      </section>

      {/* Sections grid */}
      <section className="fd-section">
        <div className="fd-container">
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 500, margin: '0 auto 48px', textAlign: 'center', lineHeight: 1.7 }}>
            Detailed recommendations with reviews and affiliate links are being added. Check back soon, or subscribe to our newsletter to be notified.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
            {SECTIONS.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', border: '1.5px solid var(--fd-border)', borderRadius: 14, padding: '26px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,107,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="var(--fd-orange)" />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', letterSpacing: '.07em', background: 'var(--fd-bg-alt)', border: '1px solid var(--fd-border)', borderRadius: 6, padding: '2px 8px' }}>
                    Coming Soon
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--fd-muted)', lineHeight: 1.7, margin: '0 0 16px' }}>{desc}</p>
                <button disabled style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fd-muted)', cursor: 'not-allowed', background: 'none', border: 'none', padding: 0 }}>
                  View recommendations <ExternalLink size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ padding: '24px 0 48px' }}>
        <div className="fd-container">
          <p style={{ fontSize: 13, color: 'var(--fd-muted)', textAlign: 'center', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, borderTop: '1px solid var(--fd-border)', paddingTop: 24 }}>
            Affiliate disclosure: Some links on this page may earn Flom Digital a commission if you make a purchase. This never affects our recommendations — we only list tools we genuinely believe in.
          </p>
        </div>
      </section>
    </>
  );
}
