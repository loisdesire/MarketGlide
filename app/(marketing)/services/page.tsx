import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Briefcase, FileText, Package, Zap, Globe, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Business consulting, importation coaching, AI automation setup, and website development from Flom Digital.',
};

const SERVICES = [
  {
    Icon:  MessageSquare,
    title: 'Mini Importation Consulting',
    desc:  'One-on-one sessions to help you find the right products, negotiate with suppliers, calculate landed costs, and plan your first or next shipment.',
  },
  {
    Icon:  Briefcase,
    title: 'Business Setup Consultation',
    desc:  'Guidance on structuring your business, choosing the right registration, opening the right accounts, and building operations that scale.',
  },
  {
    Icon:  FileText,
    title: 'Business Plan Writing',
    desc:  'Professional business plans built for funding applications, bank presentations, investor pitches, or your own roadmap.',
  },
  {
    Icon:  Package,
    title: 'Digital Product Creation',
    desc:  'We help you package your knowledge into ebooks, guides, templates, and courses that you can sell online.',
  },
  {
    Icon:  Zap,
    title: 'AI Business Automation',
    desc:  'Set up AI-powered workflows, chatbots, lead capture automations, and content systems that save you time and reduce manual work.',
  },
  {
    Icon:  Globe,
    title: 'Website Development',
    desc:  'Custom websites and web apps built on modern stacks. From simple landing pages to full business platforms like this one.',
  },
  {
    Icon:  GraduationCap,
    title: 'Training and Coaching',
    desc:  'Group or individual coaching sessions on importation, business growth, digital marketing, and income diversification.',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)' }}>Services</div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 580 }}>
            Expert help to move your business forward
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 500, lineHeight: 1.75, margin: '0 0 32px' }}>
            Whether you're starting from scratch or scaling up, we provide hands-on support across importation, business planning, technology, and digital growth.
          </p>
          <Link href="/contact" className="fd-btn fd-btn-primary">
            Book a Session <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-section-label">What we offer</div>
          <h2 className="fd-section-title">Services</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 500, margin: '0 auto 48px', textAlign: 'center', lineHeight: 1.7 }}>
            Every service is delivered personally. No templates, no outsourcing — just direct, experienced guidance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {SERVICES.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', border: '1.5px solid var(--fd-border)', borderRadius: 14, padding: '28px 26px', transition: 'box-shadow .2s', cursor: 'default' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,107,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} color="var(--fd-orange)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fd-muted)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing note */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <h2 className="fd-section-title">Ready to get started?</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Send us a message with the service you're interested in and a brief description of your situation. We'll respond within 24 hours with details and pricing.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="fd-btn fd-btn-primary">
              Get in touch <ArrowRight size={14} />
            </Link>
            <Link href="/academy" className="fd-btn fd-btn-outline">
              Browse self-study options
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
