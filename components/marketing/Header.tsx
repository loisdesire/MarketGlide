'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';

type Child = { label: string; href: string; badge?: string };
type Item  = { label: string; href?: string; children?: Child[] };

const NAV: Item[] = [
  { label: 'Home',     href: '/' },
  { label: 'Academy',  href: '/academy' },
  {
    label: 'Business Tools',
    children: [
      { label: 'Sales & Inventory Tracker',  href: '/tracker/login',                          badge: 'Live' },
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

export default function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [openSection, setOpenSection]   = useState<string | null>(null);

  function toggleSection(label: string) {
    setOpenSection(prev => prev === label ? null : label);
  }

  function closeDrawer() { setDrawerOpen(false); setOpenSection(null); }

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
                  <button className="fd-nav-link">
                    {item.label}
                    <ChevronDown size={14} />
                  </button>
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
          <Link href="/tracker/login" className="fd-header-cta">Login</Link>
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
      <div
        className={`fd-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
      />

      {/* Mobile drawer */}
      <div className={`fd-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="fd-drawer-head">
          <Link href="/" className="fd-logo" onClick={closeDrawer}>
            Flom<span>.</span>Digital
          </Link>
          <button className="fd-drawer-close" onClick={closeDrawer} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <nav className="fd-drawer-nav">
          {NAV.map(item =>
            item.children ? (
              <div key={item.label} className="fd-drawer-section">
                <button className="fd-drawer-link" onClick={() => toggleSection(item.label)}>
                  {item.label}
                  <ChevronDown
                    size={16}
                    style={{
                      transform: openSection === item.label ? 'rotate(180deg)' : 'none',
                      transition: '0.2s',
                    }}
                  />
                </button>
                {openSection === item.label &&
                  item.children.map(child => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="fd-drawer-sub-link"
                      onClick={closeDrawer}
                    >
                      {child.label}
                      {child.badge && (
                        <span className="fd-badge-live" style={{ marginLeft: 'auto' }}>
                          {child.badge}
                        </span>
                      )}
                    </Link>
                  ))}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="fd-drawer-link"
                onClick={closeDrawer}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="fd-drawer-footer">
          <Link
            href="/tracker/login"
            className="fd-btn fd-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={closeDrawer}
          >
            Login
          </Link>
          <Link
            href="/academy"
            className="fd-btn fd-btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={closeDrawer}
          >
            Explore Academy
          </Link>
        </div>
      </div>
    </header>
  );
}
