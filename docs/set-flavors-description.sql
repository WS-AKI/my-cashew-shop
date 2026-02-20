-- ============================================================
-- セット商品の味選択 + 商品紹介文
-- Supabase SQL Editor で実行してください
-- ============================================================

-- セット商品の袋数
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS set_quantity integer;

-- 商品紹介文（日本語 / タイ語）
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS description_ja text;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS description_th text;

-- 注文アイテムのメタ情報（味選択など）
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}';
