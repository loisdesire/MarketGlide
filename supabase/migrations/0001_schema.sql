-- =============================================================
--  MarketGlide — Initial Schema
-- =============================================================

-- ── User Profiles ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'Administrator', 'Manager', 'Sales Staff', 'Warehouse Staff'
);

CREATE TABLE user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL DEFAULT '',
  role       user_role NOT NULL DEFAULT 'Sales Staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Business Settings (singleton, id = 1) ─────────────────────
CREATE TABLE business_settings (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name        TEXT NOT NULL DEFAULT 'Market Glide Solutions',
  email       TEXT NOT NULL DEFAULT 'info@marketglidesolutions.com',
  address     TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id)
);
INSERT INTO business_settings DEFAULT VALUES;

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku               TEXT UNIQUE NOT NULL DEFAULT '',
  name              TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'Other',
  supplier          TEXT NOT NULL DEFAULT '',
  country_of_origin TEXT NOT NULL DEFAULT '',
  cost_price        NUMERIC(12,4) NOT NULL DEFAULT 0,
  sell_price        NUMERIC(12,4) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'USD',
  stock_qty         INTEGER NOT NULL DEFAULT 0,
  reorder_level     INTEGER NOT NULL DEFAULT 5,
  status            TEXT NOT NULL DEFAULT 'Active'
                      CHECK (status IN ('Active','Out of Stock','Discontinued')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES auth.users(id)
);

-- ── Purchase Orders ────────────────────────────────────────────
CREATE TABLE purchase_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number         TEXT UNIQUE NOT NULL,
  date_ordered      DATE NOT NULL,
  expected_delivery DATE,
  supplier          TEXT NOT NULL,
  platform          TEXT NOT NULL DEFAULT 'Other',
  product_id        UUID NOT NULL REFERENCES products(id),
  qty               INTEGER NOT NULL DEFAULT 1,
  shipping_agent    TEXT NOT NULL DEFAULT '',
  tracking_number   TEXT NOT NULL DEFAULT '',
  currency          TEXT NOT NULL DEFAULT 'USD',
  product_cost      NUMERIC(12,4) NOT NULL DEFAULT 0,
  local_delivery    NUMERIC(12,4) NOT NULL DEFAULT 0,
  warehouse_fee     NUMERIC(12,4) NOT NULL DEFAULT 0,
  shipping_cost     NUMERIC(12,4) NOT NULL DEFAULT 0,
  customs_duty      NUMERIC(12,4) NOT NULL DEFAULT 0,
  clearing_charges  NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_landed_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  unit_landed_cost  NUMERIC(12,4) NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'Pending'
                      CHECK (status IN ('Pending','In Transit','Received','Cancelled')),
  received_at       TIMESTAMPTZ,
  notes             TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES auth.users(id)
);

-- ── Customers ─────────────────────────────────────────────────
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  phone               TEXT NOT NULL DEFAULT '',
  email               TEXT NOT NULL DEFAULT '',
  address             TEXT NOT NULL DEFAULT '',
  preferred_currency  TEXT NOT NULL DEFAULT 'USD',
  total_orders        INTEGER NOT NULL DEFAULT 0,
  total_spent_usd     NUMERIC(14,4) NOT NULL DEFAULT 0,
  last_purchase_date  DATE,
  classification      TEXT NOT NULL DEFAULT 'New Customer'
                        CHECK (classification IN ('New Customer','Repeat Customer','VIP Customer')),
  notes               TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES auth.users(id)
);

-- ── Invoice Number Sequence ────────────────────────────────────
CREATE SEQUENCE invoice_number_seq START 10000;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'INV-' || lpad(nextval('invoice_number_seq')::text, 5, '0');
$$;

-- ── Sales ─────────────────────────────────────────────────────
CREATE TABLE sales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL DEFAULT generate_invoice_number(),
  date           DATE NOT NULL,
  customer_id    UUID REFERENCES customers(id) ON DELETE SET NULL,
  product_id     UUID NOT NULL REFERENCES products(id),
  qty            INTEGER NOT NULL DEFAULT 1,
  unit_price     NUMERIC(12,4) NOT NULL DEFAULT 0,
  discount       NUMERIC(12,4) NOT NULL DEFAULT 0,
  tax            NUMERIC(12,4) NOT NULL DEFAULT 0,
  shipping_fee   NUMERIC(12,4) NOT NULL DEFAULT 0,
  gross_sales    NUMERIC(12,4) NOT NULL DEFAULT 0,
  net_sales      NUMERIC(12,4) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  channel        TEXT NOT NULL DEFAULT 'Physical Store',
  status         TEXT NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending','Processing','Shipped','Delivered','Cancelled','Refunded')),
  stock_deducted BOOLEAN NOT NULL DEFAULT TRUE,
  notes          TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     UUID REFERENCES auth.users(id),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by     UUID REFERENCES auth.users(id)
);

-- ── Returns ───────────────────────────────────────────────────
CREATE TABLE returns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id       UUID NOT NULL REFERENCES sales(id),
  date          DATE NOT NULL,
  qty           INTEGER NOT NULL DEFAULT 1,
  reason        TEXT NOT NULL DEFAULT 'Defective'
                  CHECK (reason IN ('Defective','Wrong Item','Damaged','Customer Changed Mind')),
  refund_amount NUMERIC(12,4) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'USD',
  status        TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending','Refunded','Denied')),
  restock       BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID REFERENCES auth.users(id)
);

-- ── Inventory Adjustments (audit trail) ───────────────────────
CREATE TABLE inventory_adjustments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id   UUID NOT NULL REFERENCES products(id),
  qty_change   INTEGER NOT NULL,
  reason       TEXT NOT NULL DEFAULT '',
  source_type  TEXT NOT NULL DEFAULT 'manual'
                 CHECK (source_type IN ('purchase','sale','return','manual')),
  source_id    UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID REFERENCES auth.users(id)
);

-- ── Exchange Rate Cache (singleton, id = 1) ───────────────────
CREATE TABLE exchange_rate_cache (
  id         INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  rates      JSONB NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO exchange_rate_cache DEFAULT VALUES;

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_sales_date         ON sales(date DESC);
CREATE INDEX idx_sales_product      ON sales(product_id);
CREATE INDEX idx_sales_customer     ON sales(customer_id);
CREATE INDEX idx_sales_status       ON sales(status);
CREATE INDEX idx_po_product         ON purchase_orders(product_id);
CREATE INDEX idx_po_status          ON purchase_orders(status);
CREATE INDEX idx_returns_sale       ON returns(sale_id);
CREATE INDEX idx_adj_product        ON inventory_adjustments(product_id);
CREATE INDEX idx_adj_date           ON inventory_adjustments(date DESC);
