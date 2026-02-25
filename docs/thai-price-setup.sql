-- ============================================================
-- タイ人向け価格（比較用）
-- 売上ダッシュボードで「旧価格で売っていた場合との差」を出すために使用
-- 売上記録ページの一覧からインラインでタイ人価格を入力・更新するために必要
-- Supabase SQL Editor で実行してください
-- ============================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS thai_price numeric;

COMMENT ON COLUMN public.products.thai_price IS '比較用：タイ人向けに売っていた価格（バーツ）。未入力の場合は比較対象外。';

-- 売上ページで orders → order_items → products を読むため、anon の SELECT が必要
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select products for anon" ON public.products;
CREATE POLICY "Allow select products for anon"
ON public.products FOR SELECT TO anon
USING (true);

-- 売上ページでタイ人価格を更新するために必要（anon で UPDATE を許可）
DROP POLICY IF EXISTS "Allow update products for anon" ON public.products;
CREATE POLICY "Allow update products for anon"
ON public.products FOR UPDATE TO anon
USING (true)
WITH CHECK (true);
