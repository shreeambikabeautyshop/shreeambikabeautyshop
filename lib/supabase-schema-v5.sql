-- Run in Supabase SQL Editor
-- Customer Social Proof Reviews table

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name text NOT NULL,
  location text,
  review_text text,
  images text[] DEFAULT '{}',
  cloudinary_ids text[] DEFAULT '{}',
  order_type text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicate error)
DROP POLICY IF EXISTS "Public read active reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Service role reviews full access" ON customer_reviews;

-- Anyone can read active reviews
CREATE POLICY "Public read active reviews"
ON customer_reviews FOR SELECT TO anon
USING (is_active = true);

-- Only service role (admin) can insert/update/delete
CREATE POLICY "Service role reviews full access"
ON customer_reviews FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS customer_reviews_active_idx ON customer_reviews(is_active);
CREATE INDEX IF NOT EXISTS customer_reviews_sort_idx ON customer_reviews(sort_order DESC, created_at DESC);
