-- Add cost_price column to products table
-- cost_price = what you paid the distributor (the "Rate" column in your invoice)
-- This is NEVER shown to customers — only used internally for profit calculation

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT NULL;

-- Add a comment so future devs know what this field is
COMMENT ON COLUMN products.cost_price IS 'Internal cost price (distributor rate). Never shown to customers. Used for profit margin calculation in Price Manager.';

-- Optional: create index for price manager queries
CREATE INDEX IF NOT EXISTS idx_products_cost_price ON products(cost_price);
