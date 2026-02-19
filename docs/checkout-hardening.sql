-- ============================================================
-- Checkout hardening for guest orders (anon)
-- Run this once in Supabase SQL Editor
-- ============================================================

-- 0) user_id column exists only in some schemas.
--    If it exists and is NOT NULL, guest checkout will fail.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- 1) status should be text to avoid enum mismatch ("pending"/"paid"/"shipped")
ALTER TABLE public.orders
ALTER COLUMN status TYPE text USING lower(status::text);

ALTER TABLE public.orders
ALTER COLUMN status SET DEFAULT 'pending';

UPDATE public.orders
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- 2) Ensure optional slip column exists
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS slip_image_url text;

-- 2.5) order_items schema differences:
--      some DBs use price, some use unit_price.
--      create unit_price to avoid PGRST204 on inserts from frontend.
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS unit_price numeric;

-- 3) Enable RLS on checkout-related tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4) Recreate policies for orders
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
DROP POLICY IF EXISTS "Enable select for anon" ON public.orders;
DROP POLICY IF EXISTS "Enable update for anon" ON public.orders;

CREATE POLICY "Enable insert for everyone"
ON public.orders FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable select for anon"
ON public.orders FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable update for anon"
ON public.orders FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 5) Recreate policies for order_items (insert after order creation)
DROP POLICY IF EXISTS "Enable insert order_items for everyone" ON public.order_items;
DROP POLICY IF EXISTS "Enable select order_items for anon" ON public.order_items;

CREATE POLICY "Enable insert order_items for everyone"
ON public.order_items FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable select order_items for anon"
ON public.order_items FOR SELECT
TO anon
USING (true);

