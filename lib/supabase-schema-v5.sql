-- Run in Supabase SQL Editor
-- Customer Social Proof Reviews table

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name text NOT NULL,
  location text,                        -- e.g. "Mumbai", "Pan India", "Dubai"
  review_text text,                     -- optional caption
  images text[] DEFAULT '{}',           -- Cloudinary image URLs
  cloudinary_ids text[] DEFAULT '{}',   -- Cloudinary public_ids for deletion
  order_type text,                      -- e.g. "Single Item", "Bulk Order", "Repeat Order"
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read active reviews
CREATE POLICY "Public read active reviews"
ON customer_reviews FOR SELECT TO anon
USING (is_active = true);

-- Only service role (admin) can insert/update/delete
CREATE POLICY "Service role reviews full access"
ON customer_reviews FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS customer_reviews_active_idx ON customer_reviews(is_active);
CREATE INDEX IF NOT EXISTS customer_reviews_sort_idx ON customer_reviews(sort_order DESC, created_at DESC);
