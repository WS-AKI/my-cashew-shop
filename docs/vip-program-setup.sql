-- ============================================================
-- VIP 3ランク制（Normal / Silver / Gold）— ステップ1: DBスキーマ
-- ============================================================
-- 前提（既存コードに合わせた想定）:
--   - orders.total_amount = 商品小計 − 割引 + 送料（最終決済額・THB）
--   - orders.discount_amount, orders.shipping_fee が分かれている場合あり
--   - 累計・ローリングの「基準額」は total_amount を優先（無ければ計算式で再構成）
--
-- 昇格閾値（要件）:
--   Silver: 累計 5,000 THB 以上
--   Gold:   累計 15,000 THB 以上
-- ローリング維持（要件・1年サイクル）:
--   Silver: その期間中に 2,500 THB 以上購入（支払い完了分）で期限+1年
--   Gold:   その期間中に 7,500 THB 以上購入で期限+1年
--   未達ならランク1段階ダウン
--
-- 実装メモ:
--   - ランク再計算は「orders.status が支払い完了に変わったタイミング」でバックエンド（Edge Function 等）から実行する想定。
--   - 本ファイルはテーブル・列・インデックス・RLS の土台のみ。
-- ============================================================

-- 0) メール正規化用（未導入なら有効化）
CREATE EXTENSION IF NOT EXISTS citext;

-- 1) ランク型
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vip_tier') THEN
    CREATE TYPE public.vip_tier AS ENUM ('normal', 'silver', 'gold');
  END IF;
END $$;

-- 2) 閾値定数（アプリと揃える。変更時はアプリの定数も更新）
CREATE TABLE IF NOT EXISTS public.vip_program_thresholds (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  silver_lifetime_thb numeric(12,2) NOT NULL DEFAULT 5000,
  gold_lifetime_thb numeric(12,2) NOT NULL DEFAULT 15000,
  silver_rolling_thb numeric(12,2) NOT NULL DEFAULT 2500,
  gold_rolling_thb numeric(12,2) NOT NULL DEFAULT 7500,
  rank_period_days int NOT NULL DEFAULT 365,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.vip_program_thresholds (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.vip_program_thresholds IS 'VIP閾値。1行のみ運用。';

-- 3) 顧客ロイヤリティプロファイル（auth と手動インポートの橋渡し）
CREATE TABLE IF NOT EXISTS public.loyalty_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Magic Link ログイン後に紐づく（過去データ取り込み時は NULL のまま開始可）
  auth_user_id uuid UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,

  -- 手動登録・既存顧客マージ用（小文字化して一意に）
  email_normalized citext UNIQUE,

  -- オプション: 電話での突合（checkout の user_phone 正規化ルールと揃えること）
  phone_normalized text,

  vip_tier public.vip_tier NOT NULL DEFAULT 'normal',

  -- 全期間の支払い完了注文の合計（昇格判定用）
  lifetime_spent_thb numeric(14,2) NOT NULL DEFAULT 0,

  -- 現在のランクサイクル開始時刻（ランクアップ or 期限延長した瞬間）
  tier_cycle_started_at timestamptz,

  -- tier_cycle_started_at から閾値日数後（表示・バッチ用。延長時に更新）
  tier_expires_at timestamptz,

  -- 現在のサイクル内で「延長条件」に使う累計（支払い完了ベース）。延長時にリセット想定
  rolling_spent_in_cycle_thb numeric(14,2) NOT NULL DEFAULT 0,

  -- 昇格お祝いモーダル: 未表示ならセット、表示後に NULL
  celebration_pending_tier public.vip_tier,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT loyalty_profiles_identity_chk CHECK (
    auth_user_id IS NOT NULL
    OR email_normalized IS NOT NULL
    OR phone_normalized IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_loyalty_profiles_auth_user_id
  ON public.loyalty_profiles (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_loyalty_profiles_phone
  ON public.loyalty_profiles (phone_normalized)
  WHERE phone_normalized IS NOT NULL;

COMMENT ON TABLE public.loyalty_profiles IS 'VIPランク・累計購入額。auth.users と email でマージ。';
COMMENT ON COLUMN public.loyalty_profiles.tier_cycle_started_at IS '最後にランクアップまたはローリング延長した日時（サイクル起点）';
COMMENT ON COLUMN public.loyalty_profiles.tier_expires_at IS '現在のランク失効予定日時（未設定ならサイクル未開始または normal）';

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION public.set_loyalty_profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_loyalty_profiles_updated_at ON public.loyalty_profiles;
CREATE TRIGGER trg_loyalty_profiles_updated_at
  BEFORE UPDATE ON public.loyalty_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_loyalty_profiles_updated_at();

-- 4) orders への追加（既存テーブル想定）
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS loyalty_profile_id uuid REFERENCES public.loyalty_profiles (id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- 支払い完了用の status 値は運用で統一（例: paid, completed）。既存に合わせてアプリ側で定数化すること。
COMMENT ON COLUMN public.orders.paid_at IS '支払い完了に遷移した日時。VIP集計の基準。';
COMMENT ON COLUMN public.orders.loyalty_profile_id IS 'ログイン顧客またはマージ後プロファイルへのFK。ゲストは NULL 可。';

CREATE INDEX IF NOT EXISTS idx_orders_loyalty_profile_id
  ON public.orders (loyalty_profile_id)
  WHERE loyalty_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_paid_at
  ON public.orders (paid_at)
  WHERE paid_at IS NOT NULL;

-- 5) ゴールド限定商品
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_gold_exclusive boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.is_gold_exclusive IS 'true のとき Normal/Silver は購入ボタンをロック（表示は可）';

CREATE INDEX IF NOT EXISTS idx_products_gold_exclusive
  ON public.products (is_gold_exclusive)
  WHERE is_gold_exclusive = true;

-- 5b) VIP 購入要件（3段階）。アプリの正は vip_required_tier。is_gold_exclusive は gold 限定の同期用。
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS vip_required_tier text NOT NULL DEFAULT 'normal';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_vip_required_tier_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_vip_required_tier_check
  CHECK (vip_required_tier IN ('normal', 'silver', 'gold'));

COMMENT ON COLUMN public.products.vip_required_tier IS
  '購入に必要な最低会員ランク: normal=誰でも / silver=Silver以上 / gold=Goldのみ。行は常に SELECT 可。';

CREATE INDEX IF NOT EXISTS idx_products_vip_required_tier
  ON public.products (vip_required_tier)
  WHERE vip_required_tier <> 'normal';

-- 既存 is_gold_exclusive からの初期同期（新規DBではほぼ no-op）
UPDATE public.products
SET vip_required_tier = 'gold'
WHERE is_gold_exclusive IS TRUE
  AND vip_required_tier = 'normal';

UPDATE public.products
SET is_gold_exclusive = (vip_required_tier = 'gold');

-- ============================================================
-- RLS 保証（本ファイルで意図的に満たすこと）
-- ------------------------------------------------------------
-- [1] loyalty_profiles: ログイン中の本人のみ自分の行を SELECT。UPDATE はクライアント不可
--     （celebration 消しのみ SECURITY DEFINER RPC）。
-- [2] products: vip_required_tier / is_gold_exclusive でも行を隠さない。未ログイン・全ランクが SELECT 可。
--     （購入制限は UI / チェックアウト検証のみ。）
-- [3] vip_program_thresholds: anon も authenticated も SELECT 可（カート進捗用）。
-- ============================================================

-- 6a) products: ストアフロント閲覧
-- 既存マイグレーション（thai-price-setup / sales-page-rls）は多くの場合 anon の SELECT のみ。
-- Supabase はログイン時 JWT ロールが authenticated になるため、authenticated 向け SELECT が無いと
-- 商品一覧が 403 になる。vip 条件による行フィルタは付けない。
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select products for anon" ON public.products;
CREATE POLICY "Allow select products for anon"
  ON public.products FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow select products for authenticated" ON public.products;
CREATE POLICY "Allow select products for authenticated"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- ※ 管理画面等で anon UPDATE を許可している環境では、別マイグレーションの UPDATE ポリシーを維持すること
-- （本ファイルでは UPDATE を定義しない）。

-- 6b) RLS: loyalty_profiles
ALTER TABLE public.loyalty_profiles ENABLE ROW LEVEL SECURITY;

-- 本人は自分の行のみ参照可（ランク変更はサービスロール / Edge Function のみ）
DROP POLICY IF EXISTS "Loyalty: user selects own profile" ON public.loyalty_profiles;
CREATE POLICY "Loyalty: user selects own profile"
  ON public.loyalty_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- anon: ポリシーなし → 行は返らない（プロフィールの漏えい防止）
-- authenticated: INSERT / UPDATE / DELETE ポリシーは意図的に未作成 → クライアントからは拒否
-- （celebration_pending_tier のクリアのみ clear_loyalty_celebration_pending()）

-- お祝いモーダル消込のみ本人許可（vip_tier 等は更新不可）
CREATE OR REPLACE FUNCTION public.clear_loyalty_celebration_pending()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.loyalty_profiles
  SET celebration_pending_tier = NULL, updated_at = now()
  WHERE auth_user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.clear_loyalty_celebration_pending() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_loyalty_celebration_pending() TO authenticated;

-- 6c) RLS: vip_program_thresholds（anon / authenticated いずれも SELECT のみ）
ALTER TABLE public.vip_program_thresholds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "VIP thresholds public read" ON public.vip_program_thresholds;
CREATE POLICY "VIP thresholds public read"
  ON public.vip_program_thresholds FOR SELECT
  TO anon, authenticated
  USING (true);

-- 7) 手動インポート用（任意）— 既存メール・初期累計・初期ランクを取り込み、後から auth とマージ
CREATE TABLE IF NOT EXISTS public.loyalty_import_staging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized citext NOT NULL,
  phone_normalized text,
  initial_lifetime_spent_thb numeric(14,2) NOT NULL DEFAULT 0,
  initial_tier public.vip_tier NOT NULL DEFAULT 'normal',
  note text,
  imported_at timestamptz NOT NULL DEFAULT now(),
  merged_profile_id uuid REFERENCES public.loyalty_profiles (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.loyalty_import_staging IS 'CSV等の取り込み作業用。マージ完了後 loyalty_profiles に反映し merged_profile_id を記録。';

-- ============================================================
-- 次ステップ（アプリ実装側）で行うことの概要
-- ============================================================
-- A) orders を paid に更新する処理（管理画面 or 自動照合）で paid_at をセット
-- B) 同一トランザクションまたは直後に loyalty_profile_id を解決し、
--    lifetime_spent_thb を支払い済み注文の合計で再計算 → 閾値と照らして vip_tier 更新
-- C) tier_cycle_started_at / tier_expires_at / rolling_spent_in_cycle_thb のローリングルール適用
-- D) 初回ログイン時、email で loyalty_profiles を検索し auth_user_id を埋めて注文と紐づけ
-- E) celebration_pending_tier をセットし、フロントで1回モーダル表示後に NULL へ
-- ============================================================
