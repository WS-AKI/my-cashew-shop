-- ============================================================
-- orders テーブルに shipping_fee 列を追加
-- Supabase SQL Editor で実行してください
-- ============================================================

-- 1) shipping_fee 列を追加（既に存在する場合は何もしない）
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;

COMMENT ON COLUMN public.orders.shipping_fee IS '送料（バーツ）。0は送料無料。';

-- 2) discount_amount 列も念のため確認・追加
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

COMMENT ON COLUMN public.orders.discount_amount IS '割引額（バーツ）。0は割引なし。';

-- 3) order_notes 列も念のため確認・追加（備考欄）
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_notes text;

COMMENT ON COLUMN public.orders.order_notes IS 'お客様からの備考・メモ。';
