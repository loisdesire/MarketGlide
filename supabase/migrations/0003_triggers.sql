-- =============================================================
--  MarketGlide — Triggers
-- =============================================================

-- ── Auto-create user_profile on signup ───────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Sales Staff')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Keep sales.updated_at current ────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Recalculate gross/net on sales upsert ────────────────────
CREATE OR REPLACE FUNCTION recalc_sale_totals()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.gross_sales = NEW.qty * NEW.unit_price;
  NEW.net_sales   = NEW.gross_sales - NEW.discount + NEW.tax + NEW.shipping_fee;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sales_totals
  BEFORE INSERT OR UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION recalc_sale_totals();

-- ── Recalculate PO landed costs ───────────────────────────────
CREATE OR REPLACE FUNCTION recalc_po_costs()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.total_landed_cost = NEW.product_cost + NEW.local_delivery + NEW.warehouse_fee
                        + NEW.shipping_cost + NEW.customs_duty + NEW.clearing_charges;
  NEW.unit_landed_cost  = CASE WHEN NEW.qty > 0 THEN NEW.total_landed_cost / NEW.qty ELSE 0 END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER po_costs
  BEFORE INSERT OR UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION recalc_po_costs();

-- ── Update business_settings.updated_at ──────────────────────
CREATE TRIGGER biz_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
