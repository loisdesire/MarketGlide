import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import '../admin.css';
import { LayoutDashboard, FileText, Package, MessageSquare, ExternalLink } from 'lucide-react';

const NAV = [
  { label: 'Dashboard',  href: '/admin',           Icon: LayoutDashboard },
  { label: 'Blog Posts', href: '/admin/blog',       Icon: FileText },
  { label: 'Products',   href: '/admin/products',   Icon: Package },
  { label: 'Enquiries',  href: '/admin/enquiries',  Icon: MessageSquare },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/tracker/login');
  if (user.email !== process.env.PLATFORM_ADMIN_EMAIL) redirect('/');

  return (
    <div className="adm-shell">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <Link href="/admin">Flom<span>.</span>Admin</Link>
        </div>

        <div className="adm-sidebar-label">Platform</div>

        <ul className="adm-nav">
          {NAV.map(({ label, href, Icon }) => (
            <li key={href}>
              <Link href={href} className="adm-nav-link">
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="adm-sidebar-footer">
          <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.35)', textDecoration: 'none', fontSize: 12 }}>
            <ExternalLink size={12} /> View site
          </Link>
          <div style={{ marginTop: 8 }}>{user.email}</div>
        </div>
      </aside>

      {/* Content */}
      <main className="adm-content">
        {children}
      </main>
    </div>
  );
}
