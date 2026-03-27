-- ============================================================
-- products: vip_required_tier（normal | silver | gold）
-- is_gold_exclusive からの移行・後方互換
-- ============================================================
-- 方針:
-- - RLS では行を隠さない（従来どおり）。購入制御はアプリ（UI・チェックアウト検証）。
-- - アプリは vip_required_tier を正とする。is_gold_exclusive は gold 限定のミラーとして維持可。
--
-- 実行順: 本番はメンテ窓または低トラフィック時推奨。

-- 1) カラム追加
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS vip_required_tier text NOT NULL DEFAULT 'normal';

-- 2) CHECK（再実行安全）
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_vip_required_tier_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_vip_required_tier_check
  CHECK (vip_required_tier IN ('normal', 'silver', 'gold'));

COMMENT ON COLUMN public.products.vip_required_tier IS
  '購入に必要な最低会員ランク: normal=誰でも / silver=Silver以上 / gold=Goldのみ。';

-- 3) 既存フラグから移行（既に silver/gold が入っている行は上書きしない）
UPDATE public.products
SET vip_required_tier = 'gold'
WHERE is_gold_exclusive IS TRUE
  AND vip_required_tier = 'normal';

-- 4) is_gold_exclusive を tier と整合（アプリ・レポート用）
UPDATE public.products
SET is_gold_exclusive = (vip_required_tier = 'gold');

-- 5) インデックス（限定商品の抽出用）
CREATE INDEX IF NOT EXISTS idx_products_vip_required_tier
  ON public.products (vip_required_tier)
  WHERE vip_required_tier <> 'normal';

-- ------------------------------------------------------------
-- 任意: is_gold_exclusive を廃止する場合（全クライアントが vip_required_tier のみ参照後）
-- ------------------------------------------------------------
-- DROP INDEX IF EXISTS idx_products_gold_exclusive;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS is_gold_exclusive;
