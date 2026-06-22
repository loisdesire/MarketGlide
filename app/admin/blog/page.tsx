import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, FileText, Edit } from 'lucide-react';

async function getPosts() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('blog_posts')
    .select('id, slug, title, category, status, read_time_min, published_at, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as {
    id: string; slug: string; title: string; category: string;
    status: string; read_time_min: number; published_at: string | null; created_at: string;
  }[];
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Blog Posts</span>
        <Link href="/admin/blog/new" className="adm-btn adm-btn-primary adm-btn-sm">
          <Plus size={14} /> New Post
        </Link>
      </div>

      <div className="adm-page">
        <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
          {posts.length === 0 ? (
            <div className="adm-empty">
              <FileText size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
              <p style={{ margin: '0 0 16px' }}>No blog posts yet</p>
              <Link href="/admin/blog/new" className="adm-btn adm-btn-primary">
                <Plus size={14} /> Write your first post
              </Link>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Read time</th>
                    <th>Published</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <div className="adm-table-title">{post.title}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{post.slug}</div>
                      </td>
                      <td style={{ color: '#6b7280', textTransform: 'capitalize' }}>{post.category.replace(/-/g, ' ')}</td>
                      <td><span className={`adm-badge adm-badge-${post.status}`}>{post.status}</span></td>
                      <td style={{ color: '#6b7280' }}>{post.read_time_min} min</td>
                      <td style={{ color: '#6b7280', fontSize: 12 }}>{fmtDate(post.published_at)}</td>
                      <td style={{ color: '#9ca3af', fontSize: 12 }}>{fmtDate(post.created_at)}</td>
                      <td>
                        <Link href={`/admin/blog/${post.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">
                          <Edit size={13} /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
