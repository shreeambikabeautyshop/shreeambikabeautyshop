-- Run this in Supabase SQL Editor
-- Adds visitor_type and bot_reason columns to visitor_analytics

ALTER TABLE visitor_analytics
  ADD COLUMN IF NOT EXISTS visitor_type TEXT DEFAULT 'human',
  ADD COLUMN IF NOT EXISTS user_agent   TEXT,
  ADD COLUMN IF NOT EXISTS bot_reason   TEXT;

-- Index for fast human-only queries
CREATE INDEX IF NOT EXISTS idx_visitor_type
  ON visitor_analytics (visitor_type);

-- Update existing rows (old data before this update) to human
UPDATE visitor_analytics
  SET visitor_type = 'human'
  WHERE visitor_type IS NULL;
