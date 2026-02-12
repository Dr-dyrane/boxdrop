-- ═══════════════════════════════════════════════════
-- MIGRATION: Add PostGIS Geospatial Discovery
-- Date: 2026-02-12
-- ═══════════════════════════════════════════════════

-- Ensure extensions schema is in search path
set search_path to public, extensions;

-- 1. Enable PostGIS
create extension if not exists postgis with schema extensions;

-- 2. Add columns (safe idempotent adds)
alter table public.vendors 
  add column if not exists address text;

-- Add geography column (PostGIS type from extensions schema)  
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'vendors' 
    and column_name = 'location'
    and udt_name = 'geography'
  ) then
    -- Drop text location column if it exists
    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'vendors' 
      and column_name = 'location'
    ) then
      alter table public.vendors drop column location;
    end if;
    alter table public.vendors add column location extensions.geography(POINT);
  end if;
end $$;

-- 3. Spatial index
create index if not exists vendors_location_idx 
  on public.vendors using gist (location);

-- 4. Nearby Vendors RPC
create or replace function public.get_nearby_vendors(
  user_lat float,
  user_long float,
  radius_meters int default 10000
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
security definer
set search_path = public, extensions
as $$
  select 
    id, name, description, address,
    logo_url, cover_url, rating, is_featured,
    st_distance(location, st_point(user_long, user_lat)::geography) as dist_meters
  from public.vendors
  where st_dwithin(location, st_point(user_long, user_lat)::geography, radius_meters)
  order by dist_meters asc;
$$;

-- 5. Backfill coordinates for existing seed vendors
update public.vendors set 
  address = 'Victoria Island, Lagos',
  location = st_point(3.4411, 6.4253)::geography
where name = 'Cloud Kitchen';

update public.vendors set 
  address = 'Lekki Phase 1, Lagos',
  location = st_point(3.4735, 6.4485)::geography
where name = 'Fresh & Fast';

update public.vendors set 
  address = 'Ikeja GRA, Lagos',
  location = st_point(3.3551, 6.5866)::geography
where name = 'Urban Bites';

update public.vendors set 
  address = 'Surulere, Lagos',
  location = st_point(3.3619, 6.5059)::geography
where name = 'QuickMart';

update public.vendors set 
  address = 'Ikoyi, Lagos',
  location = st_point(3.4246, 6.4549)::geography
where name = 'The Grill House';
