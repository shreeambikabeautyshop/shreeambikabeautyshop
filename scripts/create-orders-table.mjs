import pg from 'pg';
const { Client } = pg;

// Supabase direct connection - password is the service role key for Supabase hosted
// The actual DB password is separate from the JWT. We need the DB password.
// Try connecting via the transaction pooler
const client = new Client({
  connectionString: 'postgresql://postgres.aukylplgvwreaovrfher:postgres@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
});

const sql = `
create table if not exists public.sabs_orders (
  id                  uuid default gen_random_uuid() primary key,
  sabs_order_id       text not null,
  shiprocket_order_id text,
  shipment_id         text,
  awb                 text,
  courier_name        text,
  estimated_delivery  text,
  customer_name       text not null,
  customer_phone      text,
  product_name        text,
  product_price       numeric,
  delivery_address    text,
  delivery_pincode    text,
  delivery_city       text,
  delivery_state      text,
  status              text default 'new',
  source              text default 'whatsapp',
  manifest_url        text,
  label_url           text,
  created_at          timestamptz default now(),
  updated_at          timestamptz
);
grant all on public.sabs_orders to service_role;
grant all on public.sabs_orders to authenticated;
`;

try {
  await client.connect();
  console.log('Connected to Supabase DB!');
  await client.query(sql);
  console.log('✅ sabs_orders table created successfully!');
  await client.end();
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
