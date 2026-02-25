-- ============================================================
-- 売上記録ページで注文・商品が表示されるようにする RLS
-- 「注文が入っているのに累計されない」場合は、本番 Supabase で未実行のポリシーがないか確認し、このファイルを実行してください。
-- Supabase SQL Editor で実行してください。
-- ============================================================

-- 1) orders: anon が全件 SELECT できること（注文一覧取得）
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable select for anon" ON public.orders;
CREATE POLICY "Enable select for anon"
ON public.orders FOR SELECT TO anon
USING (true);

-- 2) order_items: anon が全件 SELECT できること（注文明細取得）
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable select order_items for anon" ON public.order_items;
CREATE POLICY "Enable select order_items for anon"
ON public.order_items FOR SELECT TO anon
USING (true);

-- 3) products: anon が全件 SELECT できること（商品名・タイ人価格を売上で表示）
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select products for anon" ON public.products;
CREATE POLICY "Allow select products for anon"
ON public.products FOR SELECT TO anon
USING (true);
