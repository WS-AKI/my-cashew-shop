-- ============================================================
-- タイ人向け価格（比較用）
-- 売上ダッシュボードで「旧価格で売っていた場合との差」を出すために使用
-- Supabase SQL Editor で実行してください
-- ============================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS thai_price numeric;

COMMENT ON COLUMN public.products.thai_price IS '比較用：タイ人向けに売っていた価格（バーツ）。未入力の場合は比較対象外。';
