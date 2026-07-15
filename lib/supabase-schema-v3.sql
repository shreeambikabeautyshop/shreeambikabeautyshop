-- Run in Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count integer default 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS views_count integer default 0;

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing products with slugs
UPDATE products SET slug = generate_slug(name) || '-' || substring(id::text, 1, 6) WHERE slug IS NULL;

-- Make slug unique
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured);
CREATE INDEX IF NOT EXISTS products_trending_idx ON products(trending);

-- Allow public to increment views
CREATE POLICY "Public increment views" ON products
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);
