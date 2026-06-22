-- =============================================================
--  MarketGlide — Platform schema (Academy, Shop, Blog, Members)
--  These tables are UNSCOPED (no business_id) — they belong to
--  Flom Digital as the platform owner, not to tracker tenants.
--  All writes happen via the service-role admin client in API
--  routes. RLS blocks direct client access where appropriate.
-- =============================================================


-- ── 1. Platform products (Academy courses + Shop items) ───────
--  Covers every sellable item: courses, guides, templates, etc.
--  "tool_access" type is used for tools like the Tracker.

CREATE TABLE platform_products (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT    UNIQUE NOT NULL,
  title           TEXT    NOT NULL,
  description     TEXT    NOT NULL DEFAULT '',
  type            TEXT    NOT NULL DEFAULT 'guide'
                            CHECK (type IN ('course','guide','template','tool_access','bundle')),
  category        TEXT    NOT NULL DEFAULT 'importation',
  price_usd       NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_price_id TEXT    NOT NULL DEFAULT '',
  cover_url       TEXT    NOT NULL DEFAULT '',
  file_url        TEXT    NOT NULL DEFAULT '',
  is_active       BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the two products that already have landing pages
INSERT INTO platform_products (slug, title, description, type, category, price_usd, is_active, sort_order)
VALUES
  (
    'mini-importation-course',
    'Mini Importation Mastery Course',
    'The complete video-based training on building a profitable importation business from scratch.',
    'course', 'importation', 20.00, true, 1
  ),
  (
    'mini-importation-guide',
    'Mini Importation Mastery Guide',
    '22 chapters walking you through every stage of the importation business.',
    'guide', 'importation', 30.00, true, 2
  );


-- ── 2. User purchases ────────────────────────────────────────
--  Created by the Stripe webhook handler when payment succeeds.
--  One row per user per product — UNIQUE prevents double-grants.

CREATE TABLE user_purchases (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id        UUID    NOT NULL REFERENCES platform_products(id),
  stripe_session_id TEXT    NOT NULL DEFAULT '',
  amount_paid       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency          TEXT    NOT NULL DEFAULT 'usd',
  status            TEXT    NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','refunded','disputed')),
  purchased_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);


-- ── 3. Tool access ────────────────────────────────────────────
--  Tracks which tools each user can use, and how access was granted.
--  "purchase"     — paid for via Stripe
--  "form_capture" — submitted email form for a free tool
--  "manual"       — granted directly by platform admin

CREATE TABLE tool_access (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug   TEXT NOT NULL,
  granted_via TEXT NOT NULL DEFAULT 'purchase'
                CHECK (granted_via IN ('purchase','form_capture','manual')),
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_slug)
);


-- ── 4. Blog posts ─────────────────────────────────────────────
--  Content is stored as markdown in the `content` column.
--  The admin editor writes here; the public blog reads published rows.

CREATE TABLE blog_posts (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT    UNIQUE NOT NULL,
  title         TEXT    NOT NULL,
  excerpt       TEXT    NOT NULL DEFAULT '',
  content       TEXT    NOT NULL DEFAULT '',
  cover_url     TEXT    NOT NULL DEFAULT '',
  category      TEXT    NOT NULL DEFAULT 'importation'
                          CHECK (category IN (
                            'importation','entrepreneurship','business-ideas',
                            'ai-automation','marketing','sales','financial-literacy',
                            'wealth-building','productivity'
                          )),
  tags          TEXT[]  NOT NULL DEFAULT '{}',
  status        TEXT    NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','published')),
  published_at  TIMESTAMPTZ,
  read_time_min INTEGER NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 5. Email subscribers ──────────────────────────────────────
--  Collected from newsletter signup, resource downloads, etc.
--  Synced to Mailchimp/ConvertKit via API when wired up.

CREATE TABLE email_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL DEFAULT '',
  source          TEXT NOT NULL DEFAULT 'website'
                    CHECK (source IN ('homepage','resources','blog','academy','contact','manual')),
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);


-- ── 6. Resource leads ────────────────────────────────────────
--  Captured when a user submits email to download a free resource.
--  Separate from subscribers — some leads don't opt into newsletter.

CREATE TABLE resource_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  first_name    TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  resource_slug TEXT NOT NULL DEFAULT '',
  captured_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 7. Service enquiries ─────────────────────────────────────
--  Submitted via the Services page contact form.
--  Admin reviews and follows up from the admin dashboard.

CREATE TABLE service_enquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','contacted','closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 8. Indexes ────────────────────────────────────────────────

-- platform_products
CREATE INDEX idx_products_platform_active ON platform_products (is_active, sort_order);
CREATE INDEX idx_products_platform_type   ON platform_products (type);

-- user_purchases
CREATE INDEX idx_purchases_user    ON user_purchases (user_id);
CREATE INDEX idx_purchases_product ON user_purchases (product_id);
CREATE INDEX idx_purchases_stripe  ON user_purchases (stripe_session_id);

-- tool_access
CREATE INDEX idx_tool_access_user ON tool_access (user_id);
CREATE INDEX idx_tool_access_slug ON tool_access (tool_slug);

-- blog_posts
CREATE INDEX idx_blog_published  ON blog_posts (status, published_at DESC);
CREATE INDEX idx_blog_category   ON blog_posts (category);
CREATE INDEX idx_blog_slug       ON blog_posts (slug);

-- email_subscribers
CREATE INDEX idx_subscribers_email ON email_subscribers (email);

-- service_enquiries
CREATE INDEX idx_enquiries_status ON service_enquiries (status, created_at DESC);


-- ── 9. updated_at triggers ────────────────────────────────────
--  Reuses the set_updated_at() function from 0003_triggers.sql

CREATE TRIGGER platform_products_updated_at
  BEFORE UPDATE ON platform_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 10. Row Level Security ────────────────────────────────────

-- platform_products: anyone can browse active products
ALTER TABLE platform_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_products_public_read" ON platform_products
  FOR SELECT USING (is_active = true);

-- user_purchases: users see only their own rows
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_purchases_own_read" ON user_purchases
  FOR SELECT USING (user_id = auth.uid());

-- tool_access: users see only their own rows
ALTER TABLE tool_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_access_own_read" ON tool_access
  FOR SELECT USING (user_id = auth.uid());

-- blog_posts: published posts are public; drafts are invisible to clients
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (status = 'published');

-- email_subscribers, resource_leads, service_enquiries:
-- no direct client access — all writes/reads go through the
-- service-role admin client in API routes
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_leads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_enquiries ENABLE ROW LEVEL SECURITY;
-- (no policies = deny all client access; service role bypasses RLS)
