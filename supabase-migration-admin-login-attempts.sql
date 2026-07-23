-- Run this in Supabase SQL Editor
-- Creates the admin_login_attempts table to track every admin login

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address    TEXT NOT NULL,
  user_agent    TEXT,
  success       BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at
  ON admin_login_attempts (attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip
  ON admin_login_attempts (ip_address);

-- RLS: only service role can read/write (admin API uses service role key)
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- No public access — only server-side service role key can access this table
-- (Service role bypasses RLS automatically)
