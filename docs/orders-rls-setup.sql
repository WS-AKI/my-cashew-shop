-- ============================================================
-- orders テーブル RLS：未ログイン（anon）で注文作成・返却値を取得
-- 401 が出る場合は .env.local の anon キーも確認してください。
-- ============================================================

-- 0. ゲスト注文対応：user_id がある場合だけ NULL 許可にする（カラムが無い場合はスキップ）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- 1. RLS を有効化
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. 既存ポリシーを削除（必要なものだけ残す）
DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
DROP POLICY IF EXISTS "Enable select for anon" ON orders;

-- 3. 誰でも（anon）注文を 1 件追加できる
CREATE POLICY "Enable insert for everyone"
ON orders FOR INSERT
TO anon
WITH CHECK (true);

-- 4. INSERT 後の .select("id") で返却するため、anon の SELECT を許可
--    （注文作成レスポンスで id を返すために必要）
CREATE POLICY "Enable select for anon"
ON orders FOR SELECT
TO anon
USING (true);
