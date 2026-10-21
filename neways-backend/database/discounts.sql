BEGIN;

CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'category', 'color', 'size', 'product')),
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  amount_type TEXT NOT NULL CHECK (amount_type IN ('percent', 'fixed')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  redemption_count INTEGER NOT NULL DEFAULT 0 CHECK (redemption_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
  CHECK (
    (scope = 'global' AND category_id IS NULL AND product_id IS NULL AND color IS NULL AND size IS NULL)
    OR (scope = 'category' AND category_id IS NOT NULL AND product_id IS NULL AND color IS NULL AND size IS NULL)
    OR (scope = 'product' AND product_id IS NOT NULL AND category_id IS NULL AND color IS NULL AND size IS NULL)
    OR (scope = 'color' AND color IS NOT NULL AND category_id IS NULL AND product_id IS NULL AND size IS NULL)
    OR (scope = 'size' AND size IS NOT NULL AND category_id IS NULL AND product_id IS NULL AND color IS NULL)
  ),
  CHECK (code IS NOT NULL OR max_redemptions IS NULL)
);

CREATE INDEX IF NOT EXISTS discounts_active_dates_idx
  ON discounts (is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS discounts_scope_idx
  ON discounts (scope, category_id, product_id);
CREATE UNIQUE INDEX IF NOT EXISTS discounts_code_upper_idx
  ON discounts (UPPER(code))
  WHERE code IS NOT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT;

COMMIT;
