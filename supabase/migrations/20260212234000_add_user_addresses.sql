-- ─────────────────────────────────────────────────────
-- USER ADDRESSES TABLE
-- Stores saved locations like "Home", "Work", etc.
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster user address lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses" 
    ON public.addresses 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
