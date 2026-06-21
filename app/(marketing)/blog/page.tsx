import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Business tips, importation guides, and tool updates from the Flom Digital team.',
};

export default function BlogPage() {
  return (
    <>
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '64px 0 48px' }}>
        <div className="fd-container">
          <div className="fd-section-label">Blog</div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 12 }}>
            Insights for business builders
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fd-muted)', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
            Practical guides on importation, business management, and making the most of our tools.
          </p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-coming-soon">
            <div className="fd-coming-soon-icon">
              <BookOpen size={52} color="var(--fd-orange)" style={{ margin: '0 auto', display: 'block' }} />
            </div>
            <h2>Blog launching soon</h2>
            <p>
              We're working on our first articles. Check back shortly or{' '}
              <a href="/contact" style={{ color: 'var(--fd-orange)', fontWeight: 600 }}>
                subscribe to updates
              </a>{' '}
              via our contact form.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
