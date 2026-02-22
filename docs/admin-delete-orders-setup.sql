-- ============================================================
-- 管理画面から注文を削除するために必要なポリシー
-- テスト注文の削除用。Supabase SQL Editor で実行してください。
-- ============================================================
-- 削除時は order_messages → order_items → orders の順で行う必要があります。
-- アプリ側で順番に DELETE するため、anon に DELETE を許可します。

-- order_messages
DROP POLICY IF EXISTS "Allow delete order_messages for anon" ON public.order_messages;
CREATE POLICY "Allow delete order_messages for anon"
ON public.order_messages FOR DELETE TO anon USING (true);

-- order_items
DROP POLICY IF EXISTS "Allow delete order_items for anon" ON public.order_items;
CREATE POLICY "Allow delete order_items for anon"
ON public.order_items FOR DELETE TO anon USING (true);

-- orders
DROP POLICY IF EXISTS "Allow delete orders for anon" ON public.orders;
CREATE POLICY "Allow delete orders for anon"
ON public.orders FOR DELETE TO anon USING (true);
