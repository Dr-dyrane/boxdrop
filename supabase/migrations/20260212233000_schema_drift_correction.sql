
-- 1. ADD MISSING COLUMNS
-- Vendors
ALTER TABLE IF EXISTS public.vendors 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS logo_url text;

-- Products
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Orders
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS courier_lat double precision,
ADD COLUMN IF NOT EXISTS courier_lng double precision,
ADD COLUMN IF NOT EXISTS delivery_lat double precision,
ADD COLUMN IF NOT EXISTS delivery_lng double precision;

-- 2. ENSURE RLS POLICIES (Idempotent)
-- Vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read vendors" ON public.vendors;
CREATE POLICY "Anyone can read vendors" ON public.vendors FOR SELECT USING (true);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read order items" ON public.order_items;
CREATE POLICY "Read order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE public.orders.id = public.order_items.order_id 
    AND public.orders.user_id = auth.uid()
  )
);

-- 3. ENABLE POSTGIS (If not enabled)
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 4. FUNCTION FOR NEARBY VENDORS
CREATE OR REPLACE FUNCTION get_nearby_vendors(
  user_lat float,
  user_long float,
  radius_meters int default 10000
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  logo_url text,
  cover_url text,
  rating numeric,
  is_featured boolean,
  category text,
  dist_meters float
)
LANGUAGE sql
AS $$
  SELECT 
    id, 
    name, 
    description,
    address,
    logo_url,
    cover_url,
    rating,
    is_featured,
    category,
    st_distance(
      location, 
      st_point(user_long, user_lat)::geography
    ) as dist_meters
  FROM public.vendors
  WHERE 
    st_dwithin(
      location, 
      st_point(user_long, user_lat)::geography, 
      radius_meters
    )
  ORDER BY dist_meters ASC;
$$;
