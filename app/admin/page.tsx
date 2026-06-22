import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { FileText, Package, MessageSquare, ArrowRight, Clock } from 'lucide-react';

async function getStats() {
  const admin = createAdminClient();
  const [posts, products, enquiries] = await Promise.all([
    admin.from('blog_posts').select('status'),
    admin.from('platform_products').select('is_active'),
    admin.from('service_enquiries').select('status'),
  ]);

  const postRows      = (posts.data      ?? []) as { status: string }[];
  const productRows   = (products.data   ?? []) as { is_active: boolean }[];
  const enquiryRows   = (enquiries.data  ?? []) as { status: string }[];

  return {
    posts:      { total: postRows.length,    published: postRows.filter(p => p.status === 'published').length,  drafts: postRows.filter(p => p.status === 'draft').length },
    products:   { total: productRows.length, active: productRows.filter(p => p.is_active).length },
    enquiries:  { total: enquiryRows.length, newCount: enquiryRows.filter(e => e.status === 'new').length },
  };
}

async function getRecentEnquiries() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('service_enquiries')
    .select('id, name, email, service_type, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data ?? []) as { id: string; name: string; email: string; service_type: string; status: string; created_at: string }[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminDashboard() {
  const [stats, recentEnquiries] = await Promise.all([getStats(), getRecentEnquiries()]);

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Dashboard</span>
        <span className="adm-topbar-meta">Welcome back</span>
      </div>

      <div className="adm-page">
        {/* Stats */}
        <div className="adm-stat-grid">
          <div className="adm-stat">
            <div className="adm-stat-value">{stats.posts.total}</div>
            <div className="adm-stat-label">Blog Posts</div>
            <div className="adm-stat-sub">{stats.posts.published} published · {stats.posts.drafts} drafts</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-value">{stats.products.active}</div>
            <div className="adm-stat-label">Active Products</div>
            <div className="adm-stat-sub">{stats.products.total} total</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-value" style={{ color: stats.enquiries.newCount > 0 ? '#b45309' : undefined }}>
              {stats.enquiries.newCount}
            </div>
            <div className="adm-stat-label">New Enquiries</div>
            <div className="adm-stat-sub">{stats.enquiries.total} total</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="adm-card">
          <div className="adm-card-title">Quick actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/admin/blog/new" className="adm-btn adm-btn-primary">
              <FileText size={14} /> New Blog Post
            </Link>
            <Link href="/admin/products" className="adm-btn adm-btn-navy">
              <Package size={14} /> Manage Products
            </Link>
            <Link href="/admin/enquiries" className="adm-btn adm-btn-outline">
              <MessageSquare size={14} /> View Enquiries
            </Link>
          </div>
        </div>

        {/* Recent enquiries */}
        <div className="adm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="adm-card-title" style={{ margin: 0 }}>Recent enquiries</div>
            <Link href="/admin/enquiries" className="adm-btn adm-btn-ghost adm-btn-sm">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <div className="adm-empty">
              <MessageSquare size={32} className="adm-empty-icon" />
              <p>No enquiries yet</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div className="adm-table-title">{e.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{e.email}</div>
                      </td>
                      <td style={{ color: '#6b7280' }}>{e.service_type || 'General'}</td>
                      <td><span className={`adm-badge adm-badge-${e.status}`}>{e.status}</span></td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9ca3af', fontSize: 12 }}>
                        <Clock size={12} />{timeAgo(e.created_at)}
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
