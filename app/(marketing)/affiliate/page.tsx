import type { Metadata } from 'next';
import { ExternalLink, Wrench, Ship, Cpu, Megaphone, Globe, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affiliate Picks — Tools We Recommend',
  description: 'Curated tools and platforms recommended by Flom Digital for importers, entrepreneurs, and business builders.',
  openGraph: {
    title: 'Affiliate Picks — Tools We Recommend | Flom Digital',
    description: 'Curated tools and platforms recommended by Flom Digital for importers, entrepreneurs, and business builders.',
  },
};

// ─── Replace the `url` values with your real affiliate links ────────────────
const TOOLS: {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: string;
  featured?: boolean;
}[] = [
  // ── Business Tools ──────────────────────────────────────────────────────
  {
    id: 'canva',
    name: 'Canva',
    tagline: 'Design made easy',
    description: 'Create professional flyers, social media posts, invoices, and presentations — no design skills needed.',
    url: 'https://canva.com',
    category: 'business',
    featured: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    tagline: 'All-in-one workspace',
    description: 'Track orders, manage clients, write SOPs, and run your whole business in one place.',
    url: 'https://notion.so',
    category: 'business',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    tagline: 'Professional email + docs',
    description: 'Get a business email (you@yourcompany.com), Drive storage, and the full Google suite.',
    url: 'https://workspace.google.com',
    category: 'business',
  },

  // ── Importation Platforms ─────────────────────────────────────────────
  {
    id: 'alibaba',
    name: 'Alibaba',
    tagline: 'Global wholesale marketplace',
    description: 'Source products directly from verified manufacturers and suppliers worldwide. Best for bulk orders.',
    url: 'https://alibaba.com',
    category: 'importation',
    featured: true,
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    tagline: 'Small-quantity imports',
    description: 'Order smaller quantities with no minimum order requirement. Great for testing new products.',
    url: 'https://aliexpress.com',
    category: 'importation',
  },
  {
    id: 'dhgate',
    name: 'DHgate',
    tagline: 'Wholesale, lower MOQ',
    description: 'Good middle ground between AliExpress and Alibaba — lower minimums than Alibaba, more variety.',
    url: 'https://dhgate.com',
    category: 'importation',
  },

  // ── AI Tools ─────────────────────────────────────────────────────────
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    tagline: 'AI business assistant',
    description: 'Write product descriptions, reply to customer messages, create marketing copy — 10× faster.',
    url: 'https://chat.openai.com',
    category: 'ai',
    featured: true,
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    tagline: 'Professional writing',
    description: 'Ensures every email, proposal, and message you send is clear, professional, and error-free.',
    url: 'https://grammarly.com',
    category: 'ai',
  },
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'AI for longer tasks',
    description: 'Great for long-form writing, business plan drafting, and analysing documents and spreadsheets.',
    url: 'https://claude.ai',
    category: 'ai',
  },

  // ── Marketing ─────────────────────────────────────────────────────────
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    tagline: 'Email marketing',
    description: 'Build your email list and send newsletters, promotions, and automated follow-ups to customers.',
    url: 'https://mailchimp.com',
    category: 'marketing',
    featured: true,
  },
  {
    id: 'buffer',
    name: 'Buffer',
    tagline: 'Social media scheduling',
    description: 'Schedule posts across Instagram, Facebook, and X from one dashboard. Save hours every week.',
    url: 'https://buffer.com',
    category: 'marketing',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads Manager',
    tagline: 'Facebook & Instagram ads',
    description: 'Run targeted ads to reach buyers in Nigeria and across Africa. Best ROI for product businesses.',
    url: 'https://business.facebook.com',
    category: 'marketing',
  },

  // ── Website Builders ─────────────────────────────────────────────────
  {
    id: 'shopify',
    name: 'Shopify',
    tagline: 'Ecommerce store builder',
    description: 'The easiest way to launch an online store for your imported products. Handles payments, inventory, and shipping.',
    url: 'https://shopify.com',
    category: 'websites',
    featured: true,
  },
  {
    id: 'wordpress',
    name: 'WordPress + Hostinger',
    tagline: 'Full website control',
    description: 'Build a full business website with total flexibility. Best for service businesses and blogs.',
    url: 'https://hostinger.com',
    category: 'websites',
  },
  {
    id: 'carrd',
    name: 'Carrd',
    tagline: 'Quick one-page sites',
    description: 'Launch a professional landing page in 30 minutes. Perfect for lead capture and product promos.',
    url: 'https://carrd.co',
    category: 'websites',
  },

  // ── Financial ─────────────────────────────────────────────────────────
  {
    id: 'paystack',
    name: 'Paystack',
    tagline: 'Nigerian payments',
    description: 'Accept card, bank transfer, and USSD payments from Nigerian customers. Easy to set up.',
    url: 'https://paystack.com',
    category: 'financial',
    featured: true,
  },
  {
    id: 'wise',
    name: 'Wise',
    tagline: 'Cheap international transfers',
    description: 'Send money abroad to pay suppliers at the real exchange rate — far cheaper than bank wire fees.',
    url: 'https://wise.com',
    category: 'financial',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    tagline: 'Africa-wide payments',
    description: 'Accept payments from customers across Africa. Good alternative or complement to Paystack.',
    url: 'https://flutterwave.com',
    category: 'financial',
  },
];

const SECTIONS = [
  { id: 'business',    Icon: Wrench,     title: 'Business Tools',        desc: 'Run your operations efficiently.' },
  { id: 'importation', Icon: Ship,       title: 'Importation Platforms', desc: 'Source and import products safely.' },
  { id: 'ai',          Icon: Cpu,        title: 'AI Tools',              desc: 'Work smarter, not harder.' },
  { id: 'marketing',   Icon: Megaphone,  title: 'Marketing',             desc: 'Grow your audience and sales.' },
  { id: 'websites',    Icon: Globe,      title: 'Website Builders',      desc: 'Get your business online.' },
  { id: 'financial',   Icon: DollarSign, title: 'Financial Platforms',   desc: 'Get paid and pay suppliers.' },
];

export default function AffiliatePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '72px 0 56px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)', marginBottom: 14 }}>
            Recommended Tools
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-.03em', margin: '0 0 18px', maxWidth: 560, lineHeight: 1.12 }}>
            Tools and platforms we actually use
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 520, lineHeight: 1.8, margin: '0 0 28px' }}>
            Every recommendation here is something we have personally used or thoroughly evaluated.
            Some links are affiliate links — we earn a small commission at no extra cost to you.
          </p>

          {/* Quick jump links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)',
                  textDecoration: 'none', border: '1px solid rgba(255,255,255,.15)',
                  transition: 'background .15s',
                }}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      {SECTIONS.map(({ id, Icon, title, desc }) => {
        const tools = TOOLS.filter(t => t.category === id);
        return (
          <section key={id} id={id} style={{ padding: '56px 0', borderBottom: '1px solid var(--fd-border)' }}>
            <div className="fd-container">
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,107,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={22} color="var(--fd-orange)" />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fd-navy)', margin: 0, letterSpacing: '-.02em' }}>{title}</h2>
                  <p style={{ fontSize: 13.5, color: 'var(--fd-muted)', margin: 0, marginTop: 3 }}>{desc}</p>
                </div>
              </div>

              {/* Tool cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                {tools.map(tool => (
                  <div key={tool.id} style={{
                    background: '#fff',
                    border: tool.featured ? '2px solid var(--fd-orange)' : '1.5px solid var(--fd-border)',
                    borderRadius: 14,
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    position: 'relative',
                  }}>
                    {tool.featured && (
                      <span style={{
                        position: 'absolute', top: -1, right: 16,
                        fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
                        background: 'var(--fd-orange)', color: '#fff',
                        padding: '3px 10px', borderRadius: '0 0 8px 8px',
                      }}>
                        Top Pick
                      </span>
                    )}

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--fd-navy)' }}>{tool.name}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fd-orange)', marginTop: 2 }}>{tool.tagline}</div>
                    </div>

                    <p style={{ fontSize: 13.5, color: 'var(--fd-muted)', lineHeight: 1.7, margin: 0, flex: 1 }}>
                      {tool.description}
                    </p>

                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)',
                        textDecoration: 'none', marginTop: 4,
                        padding: '8px 14px', borderRadius: 8,
                        background: 'var(--fd-bg-alt)', border: '1.5px solid var(--fd-border)',
                        width: 'fit-content',
                      }}
                    >
                      Visit {tool.name} <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Disclaimer */}
      <section style={{ padding: '32px 0 56px' }}>
        <div className="fd-container">
          <p style={{ fontSize: 12.5, color: 'var(--fd-muted)', textAlign: 'center', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
            Affiliate disclosure: Some links on this page may earn Flom Digital a commission if you sign up or make a purchase.
            This never affects our recommendations — we only list tools we genuinely believe in.
          </p>
        </div>
      </section>
    </>
  );
}
