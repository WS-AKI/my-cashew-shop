-- ============================================================
-- 1. Create Storage Bucket "slips" (for payment slip images)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slips',
  'slips',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. RLS Policies: Allow public upload (INSERT) and view (SELECT)
--    DROP してから作成するので、再実行してもエラーになりません。
-- ============================================================
DROP POLICY IF EXISTS "Allow public upload to slips" ON storage.objects;
CREATE POLICY "Allow public upload to slips"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'slips');

DROP POLICY IF EXISTS "Allow public read slips" ON storage.objects;
CREATE POLICY "Allow public read slips"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'slips');

-- ============================================================
-- 3. Add slip_image_url column to orders table
-- ============================================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS slip_image_url text;

-- ============================================================
-- 4. Allow anonymous users to UPDATE orders (for slip upload)
--    Without this, slip upload saves to storage but DB update fails.
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable update for anon" ON orders;
CREATE POLICY "Enable update for anon"
ON orders FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
