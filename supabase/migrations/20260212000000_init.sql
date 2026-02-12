-- ═══════════════════════════════════════════════════
-- BOXDROP DATABASE SCHEMA
-- Run this in your Supabase SQL Editor.
-- ═══════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";

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
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
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
  location text,
  rating numeric(2,1) not null default 0.0,
  is_featured boolean not null default false,
  logo_url text,
  cover_url text,
  created_at timestamptz not null default now()
);

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

create policy "Order items visible to order owner"
  on order_items for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────

create index idx_products_vendor on products(vendor_id);
create index idx_orders_user on orders(user_id);
create index idx_orders_vendor on orders(vendor_id);
create index idx_orders_status on orders(status);
create index idx_order_items_order on order_items(order_id);
