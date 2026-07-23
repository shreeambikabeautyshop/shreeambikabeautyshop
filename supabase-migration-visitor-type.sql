-- ============================================================
-- Run this in Supabase → SQL Editor
-- 1. Adds visitor_type column (for any old rows)
-- 2. Deletes all known bot/crawler records already stored
-- 3. No new bots will be stored going forward (handled in code)
-- ============================================================

-- Step 1: Add column (safe if already exists)
ALTER TABLE visitor_analytics
  ADD COLUMN IF NOT EXISTS visitor_type TEXT DEFAULT 'human';

-- Step 2: Delete existing bot/crawler records
-- (Roubaix = OVH France datacenter, Boardman/Altoona = US datacenters, etc.)
DELETE FROM visitor_analytics
WHERE
  -- Known datacenter cities
  city IN (
    'Roubaix', 'Gravelines', 'Strasbourg', 'Villeurbanne',
    'Boardman', 'The Dalles', 'Council Bluffs', 'Des Moines', 'Quincy',
    'Ashburn', 'Herndon', 'Reston',
    'Mountain View',
    'Altoona'
  )
  OR
  -- Zero time spent + no products viewed = bot behavior
  (time_spent_seconds = 0 AND (products_viewed IS NULL OR products_viewed = '{}'))
  OR
  -- Known bot user agents (if user_agent column exists in your table)
  -- ip from known datacenter ISPs pattern
  isp ILIKE '%OVH%'
  OR isp ILIKE '%Hetzner%'
  OR isp ILIKE '%DigitalOcean%'
  OR isp ILIKE '%Amazon%'
  OR isp ILIKE '%Google LLC%'
  OR isp ILIKE '%Microsoft%'
  OR isp ILIKE '%Cloudflare%';

-- Step 3: See how many real humans remain
SELECT COUNT(*) as real_humans_remaining FROM visitor_analytics;
