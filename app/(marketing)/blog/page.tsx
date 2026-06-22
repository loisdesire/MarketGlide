import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | Flom Digital',
  description: 'Practical guides on importation, business management, and making the most of our tools.',
};

const CAT_LABEL: Record<string, string> = {
  importation:         'Importation',
  entrepreneurship:    'Entrepreneurship',
  'business-ideas':    'Business Ideas',
  'ai-automation':     'AI & Automation',
  marketing:           'Marketing',
  sales:               'Sales',
  'financial-literacy':'Financial Literacy',
  'wealth-building':   'Wealth Building',
  productivity:        'Productivity',
};

function fmt(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const admin = createAdminClient();
  const { data: posts } = await admin
    .from('blog_posts')
    .select('slug, title, excerpt, cover_url, category, read_time_min, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const items = posts ?? [];

  return (
    <>
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '32px 0 28px' }}>
        <div className="fd-container">
          <div className="fd-section-label">Blog</div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: 'var(--fd-navy)', letterSpacing: '-.03em', margin: '6px 0 0' }}>
            Insights for business builders
          </h1>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          {items.length === 0 ? (
            <div className="fd-coming-soon">
              <div className="fd-coming-soon-icon">
                <BookOpen size={52} color="var(--fd-orange)" style={{ margin: '0 auto', display: 'block' }} />
              </div>
              <h2>Articles coming soon</h2>
              <p>We&apos;re working on our first articles. Check back shortly.</p>
            </div>
          ) : (
            <div className="fd-blog-grid">
              {items.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="fd-blog-card">
                  <div className="fd-blog-img" style={p.cover_url ? { padding: 0 } : {}}>
                    {p.cover_url
                      ? <img src={p.cover_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <BookOpen size={32} />
                    }
                  </div>
                  <div className="fd-blog-body">
                    <span className="fd-blog-cat">{CAT_LABEL[p.category] ?? p.category}</span>
                    <h2 className="fd-blog-title">{p.title}</h2>
                    {p.excerpt && <p className="fd-blog-excerpt">{p.excerpt}</p>}
                    <div className="fd-blog-meta">
                      <span>{fmt(p.published_at)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {p.read_time_min} min read
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
