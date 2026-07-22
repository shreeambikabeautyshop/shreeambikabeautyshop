-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  category text DEFAULT 'Beauty Tips',
  tags text[] DEFAULT '{}',
  author text DEFAULT 'Shree Ambika Beauty Shop',
  seo_title text,
  seo_description text,
  is_published boolean DEFAULT true,
  views integer DEFAULT 0,
  read_time_minutes integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blogs" ON blog_posts FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Service role blogs" ON blog_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
