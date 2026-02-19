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
-- ============================================================
CREATE POLICY "Allow public upload to slips"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'slips');

CREATE POLICY "Allow public read slips"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'slips');

-- ============================================================
-- 3. Add slip_image_url column to orders table
-- ============================================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS slip_image_url text;
