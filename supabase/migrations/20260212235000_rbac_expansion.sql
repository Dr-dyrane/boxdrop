-- ═══════════════════════════════════════════════════
-- RBAC EXPANSION
-- Adds 'admin' and 'support' roles and improves assignment
-- ═══════════════════════════════════════════════════

-- 1. EXPAND ENUM
-- We do this in a separate block if needed, but Supabase migrations are individual.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'support';

-- 2. SECURE ROLE HELPER
-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. UPDATE NEW USER HANDLER
-- Now respects 'role' passed in raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ENHANCE RLS POLICIES
-- Profiles: Admins can see everything
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING ( (SELECT public.get_my_role()) = 'admin' );

-- Orders: Support can see all orders for troubleshooting
DROP POLICY IF EXISTS "Support can read all orders" ON public.orders;
CREATE POLICY "Support can read all orders"
  ON public.orders FOR SELECT
  USING ( (SELECT public.get_my_role()) IN ('admin', 'support') );
