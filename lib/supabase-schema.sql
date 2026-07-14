-- Run this in your Supabase SQL Editor

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null,
  category text not null,
  price numeric(10,2) not null,
  mrp numeric(10,2) not null,
  discount integer generated always as (
    floor(((mrp - price) / mrp) * 100)
  ) stored,
  description text,
  images text[] default '{}',        -- array of Cloudinary URLs
  cloudinary_ids text[] default '{}', -- array of Cloudinary public_ids
  in_stock boolean default true,
  featured boolean default false,
  trending boolean default false,
  rating numeric(2,1) default 0,
  reviews_count integer default 0,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
before update on products
for each row execute function update_updated_at();

-- Enable Row Level Security
alter table products enable row level security;

-- Public can read products
create policy "Public read products"
on products for select
to anon
using (true);

-- Only service role can insert/update/delete (admin panel uses service role)
create policy "Service role full access"
on products for all
to service_role
using (true)
with check (true);
