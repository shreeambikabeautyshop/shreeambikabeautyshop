-- Run in Supabase SQL Editor
-- v7: WhatsApp click tracking + Visitor analytics (safe to re-run)

-- 1. WhatsApp click tracking
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  product_brand text,
  product_price numeric,
  customer_name text,
  customer_phone text,
  source text DEFAULT 'product_card',
  page_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert whatsapp_clicks" ON whatsapp_clicks;
DROP POLICY IF EXISTS "Service role whatsapp_clicks" ON whatsapp_clicks;

CREATE POLICY "Public insert whatsapp_clicks" ON whatsapp_clicks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Service role whatsapp_clicks" ON whatsapp_clicks FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS whatsapp_clicks_product_idx ON whatsapp_clicks(product_id);
CREATE INDEX IF NOT EXISTS whatsapp_clicks_created_idx ON whatsapp_clicks(created_at DESC);

-- 2. Visitor analytics
CREATE TABLE IF NOT EXISTS visitor_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  ip_address text,
  country text,
  country_code text,
  region text,
  city text,
  latitude numeric,
  longitude numeric,
  timezone text,
  isp text,
  device_type text,
  os text,
  browser text,
  screen_width integer,
  screen_height integer,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_page text,
  pages_visited text[] DEFAULT '{}',
  time_spent_seconds integer DEFAULT 0,
  is_returning boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert visitor_analytics" ON visitor_analytics;
DROP POLICY IF EXISTS "Public update visitor_analytics" ON visitor_analytics;
DROP POLICY IF EXISTS "Service role visitor_analytics" ON visitor_analytics;

CREATE POLICY "Public insert visitor_analytics" ON visitor_analytics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update visitor_analytics" ON visitor_analytics FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Service role visitor_analytics" ON visitor_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS visitor_session_idx ON visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS visitor_created_idx ON visitor_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_country_idx ON visitor_analytics(country);

-- 3. Add site_mode to settings
INSERT INTO site_settings (key, value) VALUES ('site_mode', 'full') ON CONFLICT (key) DO NOTHING;
