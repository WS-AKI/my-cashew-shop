-- orders のメール列を order_email / order_email_normalized に一本化する
-- 実行環境: Supabase SQL Editor (Postgres)

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_email text,
  ADD COLUMN IF NOT EXISTS order_email_normalized citext;

-- 既存カラムから移行（存在するものだけ利用）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_email'
  ) THEN
    UPDATE public.orders
    SET order_email = COALESCE(order_email, NULLIF(trim(shipping_email), ''))
    WHERE order_email IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_email'
  ) THEN
    UPDATE public.orders
    SET order_email = COALESCE(order_email, NULLIF(trim(user_email), ''))
    WHERE order_email IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'email'
  ) THEN
    UPDATE public.orders
    SET order_email = COALESCE(order_email, NULLIF(trim(email), ''))
    WHERE order_email IS NULL;
  END IF;
END $$;

UPDATE public.orders
SET order_email_normalized = lower(trim(order_email))
WHERE order_email IS NOT NULL
  AND (order_email_normalized IS NULL OR order_email_normalized <> lower(trim(order_email)));

CREATE INDEX IF NOT EXISTS idx_orders_order_email_normalized
  ON public.orders (order_email_normalized);

COMMIT;
