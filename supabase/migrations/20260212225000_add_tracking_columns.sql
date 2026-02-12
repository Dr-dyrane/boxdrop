-- Add real-time tracking columns to orders table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_lat') THEN
        ALTER TABLE public.orders ADD COLUMN courier_lat DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_lng') THEN
        ALTER TABLE public.orders ADD COLUMN courier_lng DOUBLE PRECISION;
    END IF;
END $$;
