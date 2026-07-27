-- Popup leads table — stores contacts collected via engagement popup
CREATE TABLE IF NOT EXISTS popup_leads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  source      TEXT DEFAULT 'engagement_popup',
  page        TEXT,
  beauty_tip  TEXT,
  contacted   BOOLEAN DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_popup_leads_phone ON popup_leads(phone);
CREATE INDEX IF NOT EXISTS idx_popup_leads_created ON popup_leads(created_at DESC);

-- RLS: allow insert from client, only service role can read
ALTER TABLE popup_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert popup leads"
  ON popup_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read popup leads"
  ON popup_leads FOR SELECT
  USING (auth.role() = 'service_role');
