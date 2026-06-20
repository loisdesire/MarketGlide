-- =============================================================
--  MarketGlide — Row Level Security Policies
--  Strategy: all mutations go through API routes that use the
--  service-role client (bypasses RLS). RLS here is a safety net
--  for direct Supabase calls from the browser client.
-- =============================================================

ALTER TABLE user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales                ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rate_cache  ENABLE ROW LEVEL SECURITY;

-- Helper: get the authenticated user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::text FROM user_profiles WHERE id = auth.uid();
$$;

-- ── user_profiles ─────────────────────────────────────────────
-- Users can read their own profile; Administrators can read all
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT
  USING (id = auth.uid() OR auth_role() = 'Administrator');

-- Only Administrators can insert / update other profiles
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);  -- Supabase trigger handles creation

CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE
  USING (id = auth.uid() OR auth_role() = 'Administrator');

-- ── business_settings ─────────────────────────────────────────
CREATE POLICY "biz_settings_select" ON business_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "biz_settings_update" ON business_settings FOR UPDATE
  USING (auth_role() = 'Administrator');

-- ── products ──────────────────────────────────────────────────
CREATE POLICY "products_select" ON products FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "products_insert" ON products FOR INSERT
  WITH CHECK (auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "products_update" ON products FOR UPDATE
  USING (auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "products_delete" ON products FOR DELETE
  USING (auth_role() = 'Administrator');

-- ── purchase_orders ───────────────────────────────────────────
CREATE POLICY "po_select" ON purchase_orders FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "po_insert" ON purchase_orders FOR INSERT
  WITH CHECK (auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "po_update" ON purchase_orders FOR UPDATE
  USING (auth_role() IN ('Administrator', 'Manager', 'Warehouse Staff'));

CREATE POLICY "po_delete" ON purchase_orders FOR DELETE
  USING (auth_role() IN ('Administrator', 'Manager'));

-- ── customers ─────────────────────────────────────────────────
CREATE POLICY "customers_select" ON customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "customers_insert" ON customers FOR INSERT
  WITH CHECK (auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "customers_update" ON customers FOR UPDATE
  USING (auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "customers_delete" ON customers FOR DELETE
  USING (auth_role() IN ('Administrator', 'Manager'));

-- ── sales ─────────────────────────────────────────────────────
CREATE POLICY "sales_select" ON sales FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "sales_insert" ON sales FOR INSERT
  WITH CHECK (auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "sales_update" ON sales FOR UPDATE
  USING (auth_role() IN ('Administrator', 'Manager', 'Sales Staff'));

CREATE POLICY "sales_delete" ON sales FOR DELETE
  USING (auth_role() IN ('Administrator', 'Manager'));

-- ── returns ───────────────────────────────────────────────────
CREATE POLICY "returns_select" ON returns FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "returns_insert" ON returns FOR INSERT
  WITH CHECK (auth_role() IN ('Administrator', 'Manager'));

CREATE POLICY "returns_update" ON returns FOR UPDATE
  USING (auth_role() IN ('Administrator', 'Manager'));

-- ── inventory_adjustments ─────────────────────────────────────
CREATE POLICY "adj_select" ON inventory_adjustments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "adj_insert" ON inventory_adjustments FOR INSERT
  WITH CHECK (auth_role() IN ('Administrator', 'Manager', 'Warehouse Staff'));

-- ── exchange_rate_cache ───────────────────────────────────────
CREATE POLICY "rates_select" ON exchange_rate_cache FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "rates_update" ON exchange_rate_cache FOR UPDATE
  USING (auth.uid() IS NOT NULL);
