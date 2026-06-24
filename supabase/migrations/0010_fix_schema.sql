-- ── Fix 1: Rebuild user_purchases with correct schema ────────────
-- The original 0005 migration created this table with a different
-- structure (amount_paid, no email, wrong status values). Since
-- Stripe isn't live yet there is no real data to preserve.

DROP TABLE IF EXISTS user_purchases CASCADE;

CREATE TABLE user_purchases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id            UUID NOT NULL REFERENCES platform_products(id) ON DELETE RESTRICT,
  email                 TEXT NOT NULL,
  amount_usd            NUMERIC(10,2) NOT NULL,
  payment_provider      TEXT NOT NULL DEFAULT 'stripe',
  stripe_session_id     TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status                TEXT NOT NULL DEFAULT 'completed'
                          CHECK (status IN ('pending','completed','refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_user    ON user_purchases (user_id);
CREATE INDEX idx_purchases_product ON user_purchases (product_id);
CREATE INDEX idx_purchases_stripe  ON user_purchases (stripe_session_id);

ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_purchases" ON user_purchases
  FOR SELECT USING (user_id = auth.uid());


-- ── Fix 2: Expand platform_products type CHECK ───────────────────
-- Add 'ebook' and 'video' which the admin UI already allows
-- but the original constraint rejected.

ALTER TABLE platform_products
  DROP CONSTRAINT IF EXISTS platform_products_type_check;

ALTER TABLE platform_products
  ADD CONSTRAINT platform_products_type_check
  CHECK (type IN ('course','guide','ebook','video','template','tool_access','bundle'));


-- ── Fix 3: Remove stale unique constraint on user_id+product_id ──
-- Original 0005 added UNIQUE(user_id, product_id) which prevents
-- a user from buying the same product twice (e.g. after a refund).
-- Removed in favour of application-level logic.

ALTER TABLE user_purchases
  DROP CONSTRAINT IF EXISTS user_purchases_user_id_product_id_key;
