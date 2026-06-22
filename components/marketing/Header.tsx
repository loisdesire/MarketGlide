'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, X, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Child = { label: string; href: string; badge?: string };
type Item  = { label: string; href?: string; children?: Child[] };

const NAV: Item[] = [
  { label: 'Home',     href: '/' },
  { label: 'Academy',  href: '/academy' },
  {
    label: 'Business Tools',
    href: '/business-tools',
    children: [
      { label: 'Sales & Inventory Tracker',  href: '/tracker/login',                      badge: 'Live' },
      { label: 'Landed Cost Calculator',     href: '/business-tools/shipping-calculator' },
      { label: 'Invoice Generator',          href: '/business-tools/invoice-generator' },
      { label: 'Receipt Generator',          href: '/business-tools/receipt-generator' },
      { label: 'Currency Converter',         href: '/business-tools/currency-converter' },
    ],
  },
  { label: 'Shop',     href: '/shop' },
  { label: 'Services', href: '/services' },
  { label: 'Blog',     href: '/blog' },
];

function initials(email: string) {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

export default function Header() {
  const pathname   = usePathname();
  const router     = useRouter();

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [openSection,  setOpenSection]  = useState<string | null>(null);
  const [avatarOpen,   setAvatarOpen]   = useState(false);
  const [userEmail,    setUserEmail]    = useState<string | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Sync auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    setAvatarOpen(false);
    router.push('/');
    router.refresh();
  }

  function toggleSection(label: string) {
    setOpenSection(prev => prev === label ? null : label);
  }
  function closeDrawer() { setDrawerOpen(false); setOpenSection(null); }

  const isAdmin = userEmail === process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL;

  return (
    <header className="fd-header">
      <div className="fd-header-inner">
        {/* Logo */}
        <Link href="/" className="fd-logo">Flom<span>.</span>Digital</Link>

        {/* Desktop nav */}
        <ul className="fd-nav">
          {NAV.map(item => (
            <li key={item.label} className="fd-nav-item">
              {item.children ? (
                <>
                  <Link
                    href={item.href ?? '#'}
                    className={`fd-nav-link${pathname.startsWith(item.href ?? '__') ? ' active' : ''}`}
                  >
                    {item.label} <ChevronDown size={14} />
                  </Link>
                  <div className="fd-dropdown">
                    {item.children.map(child => (
                      <Link key={child.label} href={child.href} className="fd-dropdown-link">
                        {child.label}
                        {child.badge && <span className="fd-badge-live">{child.badge}</span>}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`fd-nav-link${pathname === item.href ? ' active' : ''}`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="fd-header-actions">
          {userEmail ? (
            /* ── Avatar menu ── */
            <div ref={avatarRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--fd-orange)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, letterSpacing: '.02em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'opacity .15s',
                }}
                aria-label="Account menu"
              >
                {initials(userEmail)}
              </button>

              {avatarOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#fff', border: '1px solid var(--fd-border)',
                  borderRadius: 10, boxShadow: 'var(--fd-shadow-lg)',
                  minWidth: 210, padding: 6, zIndex: 200,
                }}>
                  {/* Email label */}
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--fd-border)', marginBottom: 4 }}>
                    <div style={{ fontSize: 11, color: 'var(--fd-muted)', marginBottom: 2 }}>Signed in as</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fd-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userEmail}
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="fd-avatar-item"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <LayoutDashboard size={14} /> Admin panel
                    </Link>
                  )}

                  <Link
                    href="/members"
                    className="fd-avatar-item"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <User size={14} /> My account
                  </Link>

                  <Link
                    href="/members/profile"
                    className="fd-avatar-item"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <Settings size={14} /> Edit profile
                  </Link>

                  <div style={{ borderTop: '1px solid var(--fd-border)', marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={handleLogout}
                      className="fd-avatar-item"
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Sign in link ── */
            <Link href="/login" className="fd-header-cta">Sign in</Link>
          )}

          <button
            className="fd-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      <div className={`fd-drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={closeDrawer} />

      {/* Mobile drawer */}
      <div className={`fd-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="fd-drawer-head">
          <Link href="/" className="fd-logo" onClick={closeDrawer}>Flom<span>.</span>Digital</Link>
          <button className="fd-drawer-close" onClick={closeDrawer} aria-label="Close"><X size={20} /></button>
        </div>

        <nav className="fd-drawer-nav">
          {NAV.map(item =>
            item.children ? (
              <div key={item.label} className="fd-drawer-section">
                <button className="fd-drawer-link" onClick={() => toggleSection(item.label)}>
                  {item.label}
                  <ChevronDown size={16} style={{ transform: openSection === item.label ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
                </button>
                {openSection === item.label && item.children.map(child => (
                  <Link key={child.label} href={child.href} className="fd-drawer-sub-link" onClick={closeDrawer}>
                    {child.label}
                    {child.badge && <span className="fd-badge-live" style={{ marginLeft: 'auto' }}>{child.badge}</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={item.label} href={item.href!} className="fd-drawer-link" onClick={closeDrawer}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="fd-drawer-footer">
          {userEmail ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="fd-btn fd-btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={closeDrawer}>
                  Admin panel
                </Link>
              )}
              <Link href="/members" className="fd-btn fd-btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={closeDrawer}>
                My account
              </Link>
              <button onClick={() => { handleLogout(); closeDrawer(); }} className="fd-btn fd-btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#dc2626', borderColor: '#dc2626' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="fd-btn fd-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeDrawer}>Sign in</Link>
              <Link href="/academy" className="fd-btn fd-btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={closeDrawer}>Explore Academy</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
