-- ═══════════════════════════════════════════════════
-- BOXDROP DATABASE SCHEMA
-- Run this in your Supabase SQL Editor.
-- ═══════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";
-- Enable PostGIS for spatial queries
create extension if not exists postgis;

-- ──────────────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────────────

create type user_role as enum ('user', 'vendor', 'courier');
create type order_status as enum (
  'pending', 'confirmed', 'preparing',
  'picked_up', 'in_transit', 'delivered', 'cancelled'
);

-- ──────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'user',
  full_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    )
  )
  on conflict (id) do update set
    avatar_url = coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      public.profiles.avatar_url
    );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ──────────────────────────────────────────────────
-- VENDORS
-- ──────────────────────────────────────────────────

create table vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  address text,                 -- Physical address text
  location geography(POINT),    -- Lat/Lng point for spatial queries
  rating numeric(2,1) not null default 0.0,
  is_featured boolean not null default false,
  logo_url text,
  cover_url text,
  category text,                 -- Category for discovery (e.g., Restaurant, Retail)
  created_at timestamptz not null default now()
);

-- Spatial index for nearby searches
create index vendors_location_idx on public.vendors using GIST (location);

alter table vendors enable row level security;

create policy "Anyone can read vendors"
  on vendors for select using (true);

create policy "Owners can update own vendor"
  on vendors for update using (auth.uid() = owner_id);

-- ──────────────────────────────────────────────────
-- PRODUCTS
-- ──────────────────────────────────────────────────

create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  stock integer not null default 0,
  category text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "Anyone can read available products"
  on products for select using (is_available = true);

create policy "Vendor owners can manage products"
  on products for all using (
    exists (
      select 1 from vendors
      where vendors.id = products.vendor_id
      and vendors.owner_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────
-- ORDERS
-- ──────────────────────────────────────────────────

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  vendor_id uuid not null references vendors(id),
  courier_id uuid references profiles(id),
  status order_status not null default 'pending',
  total numeric(10,2) not null,
  delivery_location text,
  delivery_lat double precision,
  delivery_lng double precision,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users can read own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Users can create orders"
  on orders for insert with check (auth.uid() = user_id);

create policy "Vendors can read their orders"
  on orders for select using (
    exists (
      select 1 from vendors
      where vendors.id = orders.vendor_id
      and vendors.owner_id = auth.uid()
    )
  );

create policy "Couriers can read assigned orders"
  on orders for select using (auth.uid() = courier_id);

-- ──────────────────────────────────────────────────
-- ORDER ITEMS
-- ──────────────────────────────────────────────────

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null default 1,
  unit_price numeric(10,2) not null
);

alter table order_items enable row level security;

-- Updated: Allow customers to see their items AND vendors to see items ordered from them
create policy "Order items are visible to order stakeholders"
  on order_items for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (
        orders.user_id = auth.uid() or 
        exists (
          select 1 from vendors 
          where vendors.id = orders.vendor_id 
          and vendors.owner_id = auth.uid()
        )
      )
    )
  );

-- NEW: Allow customers to insert items into their own orders
create policy "Users can insert items into their own orders"
  on order_items for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_id
      and orders.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────
-- AUTOMATION: Updated At
-- ──────────────────────────────────────────────────

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on profiles
  for each row execute procedure handle_updated_at();

create trigger on_orders_updated
  before update on orders
  for each row execute procedure handle_updated_at();

-- ──────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────

create index idx_products_vendor on products(vendor_id);
create index idx_orders_user on orders(user_id);
create index idx_orders_vendor on orders(vendor_id);
create index idx_orders_status on orders(status);
create index idx_order_items_order on order_items(order_id);

-- ──────────────────────────────────────────────────
-- FUNCTIONS (RPC)
-- ──────────────────────────────────────────────────

-- Find vendors within a radius of a lat/lng point
create or replace function get_nearby_vendors(
  user_lat float,
  user_long float,
  radius_meters int default 10000 -- Default 10km
)
returns table (
  id uuid,
  name text,
  description text,
  address text,
  logo_url text,
  cover_url text,
  rating numeric,
  is_featured boolean,
  dist_meters float
)
language sql
as $$
  select 
    id, 
    name, 
    description,
    address,
    logo_url,
    cover_url,
    rating,
    is_featured,
    st_distance(
      location, 
      st_point(user_long, user_lat)::geography
    ) as dist_meters
  from public.vendors
  where 
    st_dwithin(
      location, 
      st_point(user_long, user_lat)::geography, 
      radius_meters
    )
  order by dist_meters asc;
$$;

-- ──────────────────────────────────────────────────
-- STORAGE SETUP
-- ──────────────────────────────────────────────────

-- 1. Create Buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('vendors', 'vendors', true)
on conflict (id) do nothing;

-- 2. Avatars RLS
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 3. Products RLS
create policy "Product images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Vendors can upload product images."
  on storage.objects for insert
  with check ( bucket_id = 'products' ); -- Simplified for now, can be narrowed to vendor_id

-- 4. Vendors RLS
create policy "Vendor assets are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'vendors' );

create policy "Vendors can upload their own assets."
  on storage.objects for insert
  with check ( bucket_id = 'vendors' );
