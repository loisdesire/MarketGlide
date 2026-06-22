import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, FileText, CheckSquare, BarChart2, Truck, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Resources',
  description: 'Free business resources, templates, checklists, and guides from Flom Digital. Download with your email.',
};

const CATEGORIES = [
  { Icon: CheckSquare, label: 'Checklists',        desc: 'Step-by-step checklists for importation, business setup, and product launch.' },
  { Icon: FileText,    label: 'Templates',          desc: 'Ready-to-use business plan, proposal, and marketing templates.' },
  { Icon: BarChart2,   label: 'Budget Planners',    desc: 'Spreadsheets for tracking expenses, projecting revenue, and planning cash flow.' },
  { Icon: Truck,       label: 'Importation Guides', desc: 'Quick-reference guides for customs, shipping terms, and supplier evaluation.' },
  { Icon: DollarSign,  label: 'Finance Worksheets', desc: 'Worksheets for pricing, profit margin, and break-even analysis.' },
  { Icon: FileText,    label: 'Startup Guides',     desc: 'Condensed guides for starting your first business or importation operation.' },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)' }}>Free Resources</div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 580 }}>
            Practical resources, available for free
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 500, lineHeight: 1.75, margin: '0 0 32px' }}>
            Templates, checklists, worksheets, and guides to help you start and grow your business. No payment needed — just your email.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Download size={16} color="var(--fd-orange)" />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>New resources added regularly</span>
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '48px 0' }}>
        <div className="fd-container">
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 10px' }}>
              Get notified when new resources drop
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fd-muted)', margin: '0 0 22px', lineHeight: 1.7 }}>
              Enter your email and we'll send you new templates, checklists, and guides as soon as they're available.
            </p>
            <form style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--fd-border)', fontSize: 14, outline: 'none' }}
              />
              <button type="submit" className="fd-btn fd-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Notify me <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Resource categories */}
      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-section-label">Resource library</div>
          <h2 className="fd-section-title">What's in the library</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 500, margin: '0 auto 48px', textAlign: 'center', lineHeight: 1.7 }}>
            Resources are added regularly. Sign up above to be the first to know when each new one is published.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {CATEGORIES.map(({ Icon, label, desc }) => (
              <div key={label} style={{ background: '#fff', border: '1.5px solid var(--fd-border)', borderRadius: 14, padding: '24px 22px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--fd-bg-alt)', border: '1px solid var(--fd-border)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Coming Soon
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,107,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color="var(--fd-orange)" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 8px' }}>{label}</h3>
                <p style={{ fontSize: 13, color: 'var(--fd-muted)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academy CTA */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <h2 className="fd-section-title">Want more than free resources?</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.7 }}>
            The Flom Academy has full courses and in-depth guides built for serious business builders.
          </p>
          <Link href="/academy" className="fd-btn fd-btn-primary">
            Visit the Academy <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
