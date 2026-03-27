-- ============================================================
-- Announcements table + RLS + Storage setup
-- ============================================================

-- 1) Create table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ja text NOT NULL,
  body_ja text NOT NULL,
  title_th text,
  body_th text,
  image_url text,
  display_start timestamptz,
  display_end timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Constraint: start <= end when both are set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'announcements_display_period_check'
  ) THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_display_period_check
      CHECK (
        display_start IS NULL
        OR display_end IS NULL
        OR display_start <= display_end
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_announcements_active_period
ON public.announcements (is_active, display_start, display_end);

CREATE INDEX IF NOT EXISTS idx_announcements_updated_at
ON public.announcements (updated_at DESC);

-- Auto update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_announcements_set_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_set_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2) RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Admin判定（Supabase Auth の app_metadata.role='admin' を想定）
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin',
    false
  );
$$;

-- Public read
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements"
ON public.announcements
FOR SELECT
TO public
USING (true);

-- Admin write
DROP POLICY IF EXISTS "Admin insert announcements" ON public.announcements;
CREATE POLICY "Admin insert announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admin update announcements" ON public.announcements;
CREATE POLICY "Admin update announcements"
ON public.announcements
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admin delete announcements" ON public.announcements;
CREATE POLICY "Admin delete announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (public.is_admin_user());

-- 3) Storage bucket for announcement images
-- 画像URLを直開きしたとき403なら: バケット public と下記「Public read announcement images」が本番DBに適用されているか確認。
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images',
  'announcement-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read announcement images" ON storage.objects;
CREATE POLICY "Public read announcement images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'announcement-images');

DROP POLICY IF EXISTS "Admin upload announcement images" ON storage.objects;
CREATE POLICY "Admin upload announcement images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'announcement-images'
  AND public.is_admin_user()
);

DROP POLICY IF EXISTS "Admin update announcement images" ON storage.objects;
CREATE POLICY "Admin update announcement images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'announcement-images'
  AND public.is_admin_user()
)
WITH CHECK (
  bucket_id = 'announcement-images'
  AND public.is_admin_user()
);

DROP POLICY IF EXISTS "Admin delete announcement images" ON storage.objects;
CREATE POLICY "Admin delete announcement images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'announcement-images'
  AND public.is_admin_user()
);

-- Optional: only one announcement row should be active at a time
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_announcement
-- ON public.announcements ((is_active))
-- WHERE is_active = true;
