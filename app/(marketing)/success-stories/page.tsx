import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Success Stories',
  description: 'Real results from Flom Digital students and clients. Importation success stories, business transformations, and testimonials.',
};

export default function SuccessStoriesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '80px 0 64px' }}>
        <div className="fd-container">
          <div className="fd-section-label" style={{ color: 'var(--fd-orange)' }}>Success Stories</div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 560 }}>
            Real people, real results
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', maxWidth: 500, lineHeight: 1.75, margin: 0 }}>
            These are the stories of entrepreneurs who applied what they learned and built something real. Importation businesses, growing brands, and financial milestones.
          </p>
        </div>
      </section>

      {/* Rating summary */}
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '32px 0' }}>
        <div className="fd-container">
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {[
              { value: '4.9/5',    label: 'Average rating' },
              { value: '100%',     label: 'Would recommend' },
              { value: 'Growing',  label: 'Student community' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: 'var(--fd-navy)' }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--fd-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-coming-soon">
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={22} color="var(--fd-orange)" fill="var(--fd-orange)" />)}
            </div>
            <h2>Stories are being collected</h2>
            <p>
              We are gathering testimonials and case studies from our students and clients. If you have had results using our courses, tools, or services, we would love to feature your story.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              <Link href="/contact" className="fd-btn fd-btn-primary">
                Share your story <ArrowRight size={14} />
              </Link>
              <Link href="/academy" className="fd-btn fd-btn-outline">
                Start your journey
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
