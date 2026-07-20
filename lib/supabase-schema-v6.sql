-- Run in Supabase SQL Editor
-- Site settings table for global toggles

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('show_price', 'true'),
  ('show_mrp', 'true')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for frontend)
CREATE POLICY "Public read site_settings"
ON site_settings FOR SELECT TO anon
USING (true);

-- Only service role can update
CREATE POLICY "Service role site_settings"
ON site_settings FOR ALL TO service_role
USING (true) WITH CHECK (true);
