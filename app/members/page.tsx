'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, BookOpen, FileText, LogOut, ExternalLink } from 'lucide-react';

type Purchase = {
  id: string;
  purchased_at: string;
  platform_products: {
    title: string;
    type: string;
    file_url: string;
    cover_url: string;
    slug: string;
  };
};

type User = { id: string; email: string | undefined; user_metadata: { full_name?: string } };

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:      <BookOpen size={16} color="#f97316" />,
  guide:       <FileText size={16} color="#f97316" />,
  template:    <FileText size={16} color="#f97316" />,
  bundle:      <ShoppingBag size={16} color="#f97316" />,
  tool_access: <ExternalLink size={16} color="#f97316" />,
};

export default function MembersPage() {
  const supabase = createClient();

  const [user,      setUser]      = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/login'; return; }
      setUser(u as User);

      const { data } = await supabase
        .from('user_purchases')
        .select('id, purchased_at, platform_products(title, type, file_url, cover_url, slug)')
        .eq('user_id', u.id)
        .order('purchased_at', { ascending: false });

      setPurchases((data ?? []) as Purchase[]);
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--fd-navy)', letterSpacing: '-.04em' }}>
            flom<span style={{ color: 'var(--fd-orange)' }}>digital</span>
          </span>
        </Link>
        <button
          onClick={signOut}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fd-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* Greeting */}
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--fd-navy)', margin: '0 0 6px', letterSpacing: '-.03em' }}>
        Hey, {firstName} 👋
      </h1>
      <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: '0 0 36px' }}>
        Here are the courses and resources you have access to.
      </p>

      {/* Content */}
      {loading ? (
        <p style={{ color: 'var(--fd-muted)', fontSize: 14 }}>Loading your purchases…</p>
      ) : purchases.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1.5px solid var(--fd-border)',
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <ShoppingBag size={40} color="#e5e7eb" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 8px' }}>
            No purchases yet
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fd-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
            When you buy a course or guide, it will appear here and you&apos;ll have instant access.
          </p>
          <Link href="/academy" className="fd-btn fd-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Browse courses & guides
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {purchases.map(p => (
            <div key={p.id} style={{
              background: '#fff',
              border: '1.5px solid var(--fd-border)',
              borderRadius: 14,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}>
              {p.platform_products.cover_url && (
                <img
                  src={p.platform_products.cover_url}
                  alt=""
                  style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {TYPE_ICONS[p.platform_products.type] ?? <FileText size={16} color="#f97316" />}
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {p.platform_products.type.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fd-navy)', marginBottom: 4 }}>
                  {p.platform_products.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fd-muted)' }}>
                  Purchased {new Date(p.purchased_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              {p.platform_products.file_url && (
                <a
                  href={p.platform_products.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fd-btn fd-btn-primary"
                  style={{ flexShrink: 0, textDecoration: 'none', fontSize: 13 }}
                >
                  {p.platform_products.type === 'course' ? 'Watch' : 'Download'}
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
