import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Eye, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'The story behind Flom Digital, our mission to help African entrepreneurs build profitable businesses.',
};

const VALUES = [
  {
    Icon:  Target,
    title: 'Mission',
    text:  'To help entrepreneurs across Nigeria and Africa build profitable businesses through practical digital education, importation knowledge, and the right tools.',
  },
  {
    Icon:  Eye,
    title: 'Vision',
    text:  'A generation of African entrepreneurs who are financially independent, globally connected, and building businesses that outlast them.',
  },
  {
    Icon:  Heart,
    title: 'Values',
    text:  'Practicality over theory. Honesty over hype. Long-term thinking over quick wins. Everything we teach and build is tested against the real world first.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)' }}>About Us</div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 580 }}>
            Built by a business builder, for business builders
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 520, lineHeight: 1.75, margin: 0 }}>
            Flom Digital exists because there was no single place that combined real importation education, practical business tools, and honest guidance in one platform.
          </p>
        </div>
      </section>

      {/* Founder story */}
      <section className="fd-section">
        <div className="fd-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'start' }}>
            <div>
              <div className="fd-section-label" style={{ textAlign: 'left' }}>The Founder</div>
              <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 20 }}>The story behind Flom Digital</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 15, color: 'var(--fd-muted)', lineHeight: 1.8, margin: 0 }}>
                  Flom Digital was founded with one goal: to make quality business education accessible to African entrepreneurs without the jargon, the fluff, or the unrealistic promises.
                </p>
                <p style={{ fontSize: 15, color: 'var(--fd-muted)', lineHeight: 1.8, margin: 0 }}>
                  The importation business is one of the most accessible paths to real income in Nigeria and across Africa, but most of the available education is either too vague to be useful or too expensive to be accessible. That gap is what Flom Digital was built to close.
                </p>
                <p style={{ fontSize: 15, color: 'var(--fd-muted)', lineHeight: 1.8, margin: 0 }}>
                  Every course, guide, and tool on this platform has been built from real experience, tested in real market conditions, and designed to produce real results.
                </p>
              </div>
              <div style={{ marginTop: 28 }}>
                <Link href="/contact" className="fd-btn fd-btn-primary">
                  Get in touch <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Photo placeholder */}
            <div style={{ background: 'var(--fd-bg-alt)', border: '1.5px solid var(--fd-border)', borderRadius: 16, aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <div style={{ textAlign: 'center', color: 'var(--fd-muted)' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--fd-border)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, margin: 0 }}>Founder photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {VALUES.map(({ Icon, title, text }) => (
              <div key={title} style={{ background: '#fff', border: '1.5px solid var(--fd-border)', borderRadius: 14, padding: '28px 24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,107,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={20} color="var(--fd-orange)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fd-muted)', lineHeight: 1.75, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fd-section">
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <h2 className="fd-section-title">Start learning today</h2>
          <p style={{ color: 'var(--fd-muted)', fontSize: 15, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Browse the academy, use the business tools, or reach out directly. Whatever you need, we're here.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/academy" className="fd-btn fd-btn-primary">Visit the Academy <ArrowRight size={14} /></Link>
            <Link href="/business-tools" className="fd-btn fd-btn-outline">Explore Tools</Link>
          </div>
        </div>
      </section>
    </>
  );
}
