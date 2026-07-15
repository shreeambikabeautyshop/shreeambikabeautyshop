-- Run this in Supabase SQL Editor to add new SEO/AI columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS key_benefits text[] default '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_to_use text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS suitable_for text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS faq jsonb default '[]';
