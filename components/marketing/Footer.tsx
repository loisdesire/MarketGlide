import Link from 'next/link';
import ScrollToTop from './ScrollToTop';
import NewsletterStrip from './NewsletterStrip';

const COLS = [
  {
    title: 'Learn',
    links: [
      { label: 'Academy',          href: '/academy' },
      { label: 'Blog',             href: '/blog' },
      { label: 'Free Resources',   href: '/resources' },
      { label: 'Success Stories',  href: '/success-stories' },
      { label: 'Affiliate Picks',  href: '/affiliate' },
    ],
  },
  {
    title: 'Business Tools',
    links: [
      { label: 'Sales & Inventory Tracker',  href: '/tracker/login' },
      { label: 'Landed Cost Calculator',     href: '/business-tools/shipping-calculator' },
      { label: 'Invoice Generator',          href: '/business-tools/invoice-generator' },
      { label: 'Receipt Generator',          href: '/business-tools/receipt-generator' },
      { label: 'Currency Converter',         href: '/business-tools/currency-converter' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',   href: '/about' },
      { label: 'Services',   href: '/services' },
      { label: 'Shop',       href: '/shop' },
      { label: 'FAQ',        href: '/faq' },
      { label: 'Contact',    href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy',    href: '/refunds' },
      { label: 'Cookie Policy',    href: '/cookies' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="fd-footer">
      <div className="fd-footer-top">
        <div className="fd-footer-brand">
          <Link href="/" className="fd-logo">Flom<span>.</span>Digital</Link>
          <p className="fd-footer-tagline">
            Business education, importation training, and productivity tools for serious business builders.
          </p>
          <div className="fd-footer-social" style={{ marginTop: 20 }}>
            <a href="https://facebook.com" className="fd-social-btn" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="https://instagram.com" className="fd-social-btn" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://twitter.com" className="fd-social-btn" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://youtube.com" className="fd-social-btn" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
            </a>
          </div>
        </div>

        {COLS.map(col => (
          <div key={col.title}>
            <div className="fd-footer-col-title">{col.title}</div>
            <ul className="fd-footer-links">
              {col.links.map(l => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <NewsletterStrip />

      <div>
        <div className="fd-footer-bottom">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
            © {year} Flom Digital. All rights reserved.
          </span>
          <nav className="fd-footer-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </nav>
        </div>
      </div>

      <ScrollToTop />
    </footer>
  );
}
