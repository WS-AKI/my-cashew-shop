-- ============================================================
-- Product price variants: サイズ別価格を JSONB で格納
-- Supabase SQL Editor で実行してください
-- ============================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_variants jsonb DEFAULT '[]';
