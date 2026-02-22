-- ============================================================
-- 商品ギャラリー画像 + レビュー機能
-- Supabase SQL Editor で実行してください
-- ============================================================

-- 商品のギャラリー画像（URL配列を JSONB で保存）
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gallery_urls jsonb DEFAULT '[]';

-- ──────────────────────────────────────────────
-- レビューテーブル
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read reviews" ON public.product_reviews
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.product_reviews;
CREATE POLICY "Anyone can insert reviews" ON public.product_reviews
  FOR INSERT TO anon WITH CHECK (true);
