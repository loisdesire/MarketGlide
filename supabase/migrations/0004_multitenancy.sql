-- =============================================================
--  MarketGlide — Multi-tenancy migration
--  Adds a `businesses` table and scopes every data table to it.
--  Safe to run against an existing single-tenant database —
--  existing rows are linked to a seed business automatically.
-- =============================================================

-- ── 1. businesses table ───────────────────────────────────────
-- Absorbs business_settings (name/email/address) as the tenant anchor.
CREATE TABLE IF NOT EXISTS businesses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  address    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate any existing business_settings row into businesses
INSERT INTO businesses (name, email, address)
SELECT name, COALESCE(email, ''), COALESCE(address, '')
FROM business_settings WHERE id = 1
LIMIT 1;

-- If nothing existed, create a placeholder business
INSERT INTO businesses (name)
SELECT 'My Business'
WHERE NOT EXISTS (SELECT 1 FROM businesses);

-- ── 2. Add business_id to every data table ───────────────────
ALTER TABLE user_profiles         ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE products              ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE purchase_orders       ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE customers             ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE sales                 ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE returns               ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- ── 3. Seed existing rows with the first business ────────────
UPDATE user_profiles         SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;
UPDATE products              SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;
UPDATE purchase_orders       SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;
UPDATE customers             SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;
UPDATE sales                 SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;
UPDATE returns               SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;
UPDATE inventory_adjustments SET business_id = (SELECT id FROM businesses ORDER BY created_at LIMIT 1) WHERE business_id IS NULL;

-- ── 4. Performance indexes ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_business         ON user_profiles         (business_id);
CREATE INDEX IF NOT EXISTS idx_products_business              ON products              (business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_business       ON purchase_orders       (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business             ON customers             (business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business                 ON sales                 (business_id);
CREATE INDEX IF NOT EXISTS idx_returns_business               ON returns               (business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_business ON inventory_adjustments (business_id);

-- ── 5. Helper: current user's business_id ────────────────────
CREATE OR REPLACE FUNCTION auth_business_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT business_id FROM user_profiles WHERE id = auth.uid()
$$;

-- ── 6. RLS on businesses ──────────────────────────────────────
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_select" ON businesses FOR SELECT
  USING (id = auth_business_id());

CREATE POLICY "businesses_update" ON businesses FOR UPDATE
  USING (id = auth_business_id() AND auth_role() = 'Administrator');

-- ── 7. Replace RLS policies with business-scoped versions ─────

-- user_profiles
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;

CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT
  USING (business_id = auth_business_id() OR id = auth.uid());

CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE
  USING (id = auth.uid() OR (business_id = auth_business_id() AND auth_role() = 'Administrator'));

-- products
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

CREATE POLICY "products_select" ON products FOR SELECT
  USING (business_id = auth_business_id());

CREATE POLICY "products_insert" ON products FOR INSERT
  WITH CHECK (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "products_update" ON products FOR UPDATE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "products_delete" ON products FOR DELETE
  USING (business_id = auth_business_id() AND auth_role() = 'Administrator');

-- purchase_orders
DROP POLICY IF EXISTS "po_select" ON purchase_orders;
DROP POLICY IF EXISTS "po_insert" ON purchase_orders;
DROP POLICY IF EXISTS "po_update" ON purchase_orders;
DROP POLICY IF EXISTS "po_delete" ON purchase_orders;

CREATE POLICY "po_select" ON purchase_orders FOR SELECT
  USING (business_id = auth_business_id());

CREATE POLICY "po_insert" ON purchase_orders FOR INSERT
  WITH CHECK (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "po_update" ON purchase_orders FOR UPDATE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager', 'Warehouse Staff'));

CREATE POLICY "po_delete" ON purchase_orders FOR DELETE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

-- customers
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;

CREATE POLICY "customers_select" ON customers FOR SELECT
  USING (business_id = auth_business_id());

CREATE POLICY "customers_insert" ON customers FOR INSERT
  WITH CHECK (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "customers_update" ON customers FOR UPDATE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "customers_delete" ON customers FOR DELETE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

-- sales
DROP POLICY IF EXISTS "sales_select" ON sales;
DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sales_update" ON sales;
DROP POLICY IF EXISTS "sales_delete" ON sales;

CREATE POLICY "sales_select" ON sales FOR SELECT
  USING (business_id = auth_business_id());

CREATE POLICY "sales_insert" ON sales FOR INSERT
  WITH CHECK (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "sales_update" ON sales FOR UPDATE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "sales_delete" ON sales FOR DELETE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

-- returns
DROP POLICY IF EXISTS "returns_select" ON returns;
DROP POLICY IF EXISTS "returns_insert" ON returns;
DROP POLICY IF EXISTS "returns_update" ON returns;

CREATE POLICY "returns_select" ON returns FOR SELECT
  USING (business_id = auth_business_id());

CREATE POLICY "returns_insert" ON returns FOR INSERT
  WITH CHECK (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "returns_update" ON returns FOR UPDATE
  USING (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager'));

-- inventory_adjustments
DROP POLICY IF EXISTS "adj_select" ON inventory_adjustments;
DROP POLICY IF EXISTS "adj_insert" ON inventory_adjustments;

CREATE POLICY "adj_select" ON inventory_adjustments FOR SELECT
  USING (business_id = auth_business_id());

CREATE POLICY "adj_insert" ON inventory_adjustments FOR INSERT
  WITH CHECK (business_id = auth_business_id() AND auth_role() IN ('Administrator', 'Manager', 'Warehouse Staff'));

-- ── 8. updated_at trigger for businesses ─────────────────────
CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
