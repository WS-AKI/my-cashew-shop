-- ============================================================
-- 注文のオーディエンス（日本向け / タイ向け）を記録するカラム
-- サブドメイン分離により、どのサイトから発注したかを保存する
-- Supabase SQL Editor で実行してください
-- ============================================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS audience text;

COMMENT ON COLUMN public.orders.audience IS '注文元: ja = 日本向けサイト, th = タイ向けサイト。NULL は既存データ。';
