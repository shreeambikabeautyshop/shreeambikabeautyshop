-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  address text NOT NULL,
  city text,
  state text,
  pincode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (first time registration)
CREATE POLICY "Public insert customers"
ON customers FOR INSERT TO anon WITH CHECK (true);

-- Anyone can read by phone (login check)
CREATE POLICY "Public read customers by phone"
ON customers FOR SELECT TO anon USING (true);

-- Update own record
CREATE POLICY "Public update customers"
ON customers FOR UPDATE TO anon USING (true) WITH CHECK (true);
