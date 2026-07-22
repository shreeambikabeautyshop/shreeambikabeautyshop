-- Add advanced tracking columns to visitor_analytics table
-- Run this in Supabase SQL Editor

ALTER TABLE visitor_analytics 
ADD COLUMN IF NOT EXISTS products_viewed text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS categories_viewed text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_scroll_depth integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_query text,
ADD COLUMN IF NOT EXISTS hour_of_visit integer,
ADD COLUMN IF NOT EXISTS day_of_week integer;

-- Add index on hour_of_visit and day_of_week for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_hour ON visitor_analytics(hour_of_visit);
CREATE INDEX IF NOT EXISTS idx_visitor_day ON visitor_analytics(day_of_week);
CREATE INDEX IF NOT EXISTS idx_visitor_city ON visitor_analytics(city);
CREATE INDEX IF NOT EXISTS idx_visitor_created ON visitor_analytics(created_at DESC);

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'visitor_analytics' 
  AND column_name IN ('products_viewed', 'categories_viewed', 'max_scroll_depth', 'search_query', 'hour_of_visit', 'day_of_week');
