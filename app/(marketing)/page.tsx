import Link from 'next/link';
import {
  BookOpen, GraduationCap, Wrench, ArrowRight,
  LayoutDashboard, TrendingUp, CheckCircle,
} from 'lucide-react';
import TrustBadgeRow from '@/components/marketing/TrustBadgeRow';

/* ─── Hero ──────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="fd-hero">
      <div className="fd-hero-inner">
        <div>
          <span className="fd-hero-eyebrow">Business Education &amp; Tools</span>
          <h1 className="fd-hero-headline">
            Learn. Build.<br />
            <span className="accent">Automate. Profit.</span>
          </h1>
          <p className="fd-hero-sub">
            From importation strategies to practical business tools, get everything you need to
            start, manage, and scale your business in one place.
          </p>
          <div className="fd-hero-ctas">
            <Link href="/shop" className="fd-btn fd-btn-primary">
              Get the Book <ArrowRight size={16} />
            </Link>
            <Link href="/tracker/login" className="fd-btn fd-btn-outline-white">
              Open the Tracker
            </Link>
          </div>
        </div>

        <div className="fd-hero-visual">
          <div className="fd-hero-visual-inner">
            <div className="fd-hero-card">
              <div className="fd-hero-card-icon">
                <BookOpen size={20} color="#fff" />
              </div>
              <div>
                <div className="fd-hero-card-title">Mini Importation Mastery Guide</div>
                <div className="fd-hero-card-sub">22 chapters · Proven strategies · Real contacts</div>
              </div>
            </div>

            <div className="fd-hero-card">
              <div className="fd-hero-card-icon" style={{ background: '#3B82F6' }}>
                <LayoutDashboard size={20} color="#fff" />
              </div>
              <div>
                <div className="fd-hero-card-title">Sales &amp; Inventory Tracker</div>
                <div className="fd-hero-card-sub">Multi-currency · Multi-user · Business</div>
              </div>
            </div>

            <div className="fd-hero-stat-row">
              <div className="fd-hero-stat">
                <div className="fd-hero-stat-val">22+</div>
                <div className="fd-hero-stat-lbl">Chapters</div>
              </div>
              <div className="fd-hero-stat">
                <div className="fd-hero-stat-val">5+</div>
                <div className="fd-hero-stat-lbl">Free Tools</div>
              </div>
              <div className="fd-hero-stat">
                <div className="fd-hero-stat-val">∞</div>
                <div className="fd-hero-stat-lbl">Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── What We Offer ─────────────────────────────────────────── */
function WhatWeOffer() {
  const offers = [
    {
      Icon: BookOpen,
      title: 'The Book',
      desc: 'The Mini Importation Mastery Guide walks you through everything, from finding suppliers to making your first sale. 22 chapters, zero fluff.',
      cta: 'Get the Book',
      href: '/shop',
    },
    {
      Icon: GraduationCap,
      title: 'The Course',
      desc: 'The Importation Mastery Course takes you deeper with video lessons, live Q&As, real supplier contacts, and a community of fellow business builders.',
      cta: 'Join the Course',
      href: '/shop',
    },
    {
      Icon: Wrench,
      title: 'Business Tools',
      desc: 'Practical tools built for business: Landed Cost Calculator, Invoice Generator, Receipt Generator, Currency Converter, and more.',
      cta: 'Explore Tools',
      href: '/business-tools',
    },
  ];

  return (
    <section className="fd-section" style={{ background: 'var(--fd-bg-alt)' }}>
      <div className="fd-container">
        <div className="fd-section-heading">
          <div className="fd-section-label">What We Offer</div>
          <h2 className="fd-section-title">Everything you need to win in business</h2>
          <p className="fd-section-sub">
            Whether you're starting from scratch or scaling up, we have the education and tools to get you there.
          </p>
        </div>
        <div className="fd-offers-grid">
          {offers.map(({ Icon, title, desc, cta, href }) => (
            <Link key={title} href={href} className="fd-offer-tile">
              <div className="fd-offer-icon">
                <Icon size={26} />
              </div>
              <h3 className="fd-offer-title">{title}</h3>
              <p className="fd-offer-desc">{desc}</p>
              <span className="fd-offer-cta">{cta} <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Featured banner ───────────────────────────────────────── */
function FeaturedBanner() {
  return (
    <section className="fd-promo">
      <div className="fd-container fd-promo-inner">
        <p className="fd-promo-label">Featured Offer</p>
        <h2 className="fd-promo-headline">
          Start your importation journey today
        </h2>
        <p className="fd-promo-sub">
          Join the course and get access to proven strategies, real supplier contacts,
          and a community of business builders who are already winning.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" className="fd-btn fd-btn-primary">
            Enroll Now <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="fd-btn fd-btn-outline-white">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Product showcase ──────────────────────────────────────── */
function ProductShowcase() {
  return (
    <section className="fd-section">
      <div className="fd-container">
        <div className="fd-section-heading">
          <div className="fd-section-label">Our Products</div>
          <h2 className="fd-section-title">Built for serious business builders</h2>
          <p className="fd-section-sub">
            Every product is designed to give you a real, practical advantage in your business.
          </p>
        </div>
        <div className="fd-products-grid">

          {/* Book */}
          <div className="fd-product-card">
            <div className="fd-product-cover fd-product-cover-book">
              <div className="fd-product-cover-accent" />
              <span className="fd-product-cover-badge">Bestseller</span>
              <div className="fd-product-cover-label">Digital Guide</div>
              <div className="fd-product-cover-title">Mini Importation Mastery Guide</div>
              <span className="fd-product-cover-sub">22 chapters · Worksheets · Checklists</span>
              <div className="fd-product-cover-icon">
                <BookOpen size={26} color="var(--fd-orange)" />
              </div>
            </div>
            <div className="fd-product-body">
              <h3 className="fd-product-title">Mini Importation Mastery Guide</h3>
              <p className="fd-product-desc">22 chapters covering every stage of the importation business, from sourcing to selling. Includes bonus worksheets and checklists.</p>
              <div className="fd-product-price">See pricing</div>
              <Link href="/shop" className="fd-btn fd-btn-primary fd-btn-sm">
                View Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Course */}
          <div className="fd-product-card">
            <div className="fd-product-cover fd-product-cover-course">
              <div className="fd-product-cover-accent" />
              <span className="fd-product-cover-badge badge-new">New</span>
              <div className="fd-product-cover-label">Video Course</div>
              <div className="fd-product-cover-title">Importation Mastery Course</div>
              <span className="fd-product-cover-sub">Video lessons · Live Q&amp;As · Community</span>
              <div className="fd-product-cover-icon">
                <GraduationCap size={26} color="#93c5fd" />
              </div>
            </div>
            <div className="fd-product-body">
              <h3 className="fd-product-title">Importation Mastery Course</h3>
              <p className="fd-product-desc">Video-based course with live support, real supplier contact lists, and lifetime access. The complete importation education.</p>
              <div className="fd-product-price">See pricing</div>
              <Link href="/shop" className="fd-btn fd-btn-primary fd-btn-sm">
                View Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Tracker */}
          <div className="fd-product-card">
            <div className="fd-product-cover fd-product-cover-tracker">
              <div className="fd-product-cover-accent" />
              <span className="fd-product-cover-badge badge-pro">Pro</span>
              <div className="fd-cover-dash">
                {['Sales', '₦420k', '89 units', 'Profit', '32%', 'Active'].map((v, i) => (
                  <div key={i} className={`fd-cover-dash-cell${i === 1 || i === 4 ? ' green' : ''}`}>{v}</div>
                ))}
              </div>
              <div className="fd-product-cover-label">Business Tracker</div>
              <div className="fd-product-cover-title">Sales &amp; Inventory Tracker</div>
              <span className="fd-product-cover-sub">Multi-user · Multi-currency</span>
            </div>
            <div className="fd-product-body">
              <h3 className="fd-product-title">Sales &amp; Inventory Tracker</h3>
              <p className="fd-product-desc">A full-featured business tracker: manage products, sales, purchases, customers, invoices, and reports. Multi-user. Multi-currency.</p>
              <div className="fd-product-price">Sign up to access</div>
              <Link href="/tracker/login" className="fd-btn fd-btn-primary fd-btn-sm">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Two-up CTA ─────────────────────────────────────────────── */
function TwoUpCTA() {
  return (
    <section className="fd-section" style={{ background: 'var(--fd-bg-alt)' }}>
      <div className="fd-container">
        <div className="fd-twoup">
          <div className="fd-twoup-card">
            <p className="fd-twoup-eyebrow">Business Tracker</p>
            <h3 className="fd-twoup-title">Get organised with the Tracker</h3>
            <p className="fd-twoup-sub">
              Track your products, sales, purchases, and customers, all in one place.
              Multi-user. Multi-currency. Built for growing businesses.
            </p>
            <Link href="/tracker/login" className="fd-btn fd-btn-primary fd-btn-sm">
              Open the Tracker <ArrowRight size={14} />
            </Link>
          </div>

          <div className="fd-twoup-card">
            <p className="fd-twoup-eyebrow" style={{ color: 'var(--fd-orange)' }}>Education</p>
            <h3 className="fd-twoup-title" style={{ color: 'var(--fd-navy)' }}>
              Already importing? Level up with the course
            </h3>
            <p className="fd-twoup-sub">
              Get the playbook, real supplier contacts, and the community to help you
              go from side hustle to full-scale operation.
            </p>
            <Link href="/shop" className="fd-btn fd-btn-outline fd-btn-sm">
              See the Course <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ──────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="fd-section">
      <div className="fd-container">
        <div className="fd-section-heading">
          <div className="fd-section-label">Testimonials</div>
          <h2 className="fd-section-title">What our customers say</h2>
        </div>
        <div className="fd-testimonials-empty">
          <TrendingUp size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--fd-orange)' }} />
          <strong style={{ display: 'block', marginBottom: 6, color: 'var(--fd-navy)' }}>
            Reviews coming soon
          </strong>
          Be among the first to use Flom Digital and share your experience.
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeOffer />
      <FeaturedBanner />
      <ProductShowcase />
      <TwoUpCTA />
      <Testimonials />
      <TrustBadgeRow />
    </>
  );
}
