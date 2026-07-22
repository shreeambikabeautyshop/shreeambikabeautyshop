-- Short URL system tables
-- Run this in Supabase SQL Editor

-- Table for short links
CREATE TABLE IF NOT EXISTS short_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  original_url text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_slug text,
  product_name text,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table for click analytics
CREATE TABLE IF NOT EXISTS short_link_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id uuid REFERENCES short_links(id) ON DELETE CASCADE,
  code text NOT NULL,
  source text DEFAULT 'direct',
  referer text,
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_short_links_code ON short_links(code);
CREATE INDEX IF NOT EXISTS idx_short_links_product ON short_links(product_slug);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_link ON short_link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_created ON short_link_clicks(created_at DESC);

-- RLS policies
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_link_clicks ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role short_links" ON short_links FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role short_link_clicks" ON short_link_clicks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public can read short links (for redirect)
CREATE POLICY "Public read short_links" ON short_links FOR SELECT TO anon USING (true);
