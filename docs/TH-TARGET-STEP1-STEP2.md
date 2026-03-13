# タイ人向け展開：ステップ1（現状解析）・ステップ2（アーキテクチャ提案）

## ステップ1：現状のコードベース解析

### 1. 技術スタック

| 項目 | 内容 |
|------|------|
| **フレームワーク** | Next.js 16.1.6（App Router） |
| **UI** | React 19, Tailwind CSS 4 |
| **DB・BaaS** | Supabase（@supabase/ssr, @supabase/supabase-js） |
| **デプロイ** | Cloudflare Workers / Pages（OpenNext アダプター） |
| **その他** | recharts, swiper, promptpay-qr, tesseract.js（OCR）など |

- ルーティング: `app/` 配下のファイルベース（`/`, `/products`, `/cart`, `/checkout`, `/about`, `/shipping`, `/track`, `/order-success`, `/admin/*` など）。
- 現状、**ロケールやオーディエンス（日本人/タイ人）によるルート分岐は一切なし**。単一のURLツリーで日本語メイン＋タイ語を補助表示している。

---

### 2. 商品データ（価格・商品名）の管理

#### 2.1 データソース

- **Supabase** の `products` テーブルが唯一のソース。
- 取得は **サーバーコンポーネント** で `createClient()` から直接 `from("products").select(...)`（例: `app/_components/ProductsGrid.tsx`）。API Route 経由の取得は行っていない。

#### 2.2 商品スキーマ（types/index.ts ＋ DB）

- **共通**
  - `id`, `name_ja`, `name_th`, `description_ja`, `description_th`
  - `image_url`, `gallery_urls`, `stock`, `is_active`, `is_promotion`, `display_order`
  - `flavor_color`, `weight_g`, `is_set`, `set_quantity`, `created_at`
- **価格（日本向け＝メイン）**
  - `price`, `sale_price` … 単一価格商品用
  - `price_variants` (JSONB) … サイズ別。各要素: `size_g`, `price`, `sale_price`, `image_url`, （オプション）`thai_price`
- **タイ人向け価格（現状の用途は「比較用」のみ）**
  - `products.thai_price` … 単一価格用（`docs/thai-price-setup.sql` で追加）
  - `price_variants[].thai_price` … サイズ別タイ価格（管理画面の売上ページで入力）

**重要**: お客様向け画面では **`thai_price` を select していない**（`ProductsGrid` のコメント通り「管理者ページ専用」）。つまり **現在は全ユーザーに `price` / `sale_price`（日本向け価格）のみを表示**している。

#### 2.3 表示の仕方

- **商品名**: カード・カート・チェックアウトでは `name_ja` をメイン、`name_th` はあればサブ表示（`ProductCard`, `cart/page.tsx`, `checkout/page.tsx`）。
- **価格**: すべて `price` / `sale_price` および `price_variants[].price|sale_price` のみ使用。通貨表記は「฿」で統一（バーツ）。
- **文言**: `lib/shop-config.ts` の `SHOP_TEXT` が `ja` / `th` キーで両言語を保持。UI では `DualLanguageLabel` で「日本語メイン ＋ タイ語サブ」の形で両方出している（言語切り替えではなく常に両方表示）。

#### 2.4 注文・カート

- **注文**: `orders` と `order_items` に保存。`order_items` に `unit_price`（または `price` / `price_at_purchase`）で「購入時単価」を保存。**オーディエンス（日/泰）の区別は保存していない**。
- **カート**: クライアント側（CartContext）で `Product` オブジェクトを保持。サーバーに永続化していない。

---

### 3. まとめ（現状）

- 技術的には **単一の Next.js アプリ**で、**単一の Supabase `products` テーブル**に日泰両方の名前・説明と、**日本向け価格（price/sale_price）** および **タイ向け価格（thai_price）** が同居している。
- **タイ向け価格は管理・比較用**であり、フロントでは一切表示していない。
- **オーディエンスの分離はなく**、言語切り替えボタンもないが、**同じ価格を全員が見ている**状態。  
→ タイ人向けに「別価格」で見せ、かつ日本向け価格を絶対に見せないようにするには、**ルーティング・データ取得・表示をオーディエンスで完全に分離する設計**が必要。

---

## ステップ2：最適な分離・ルーティングアーキテクチャの提案

### 1. 要件の整理

- **日本向け**: 現在の `price` / `sale_price`（および `price_variants` のそれ）のみ表示。
- **タイ向け**: タイ用価格（`thai_price` および `price_variants[].thai_price`）のみ表示。日本向け価格は見せない。
- **同一国内（タイ）**のため **Geo-IP は使えない**。
- **「日本人がタイ向け価格を見る」「タイ人が日本向け価格を見る」ことをシステム的に防ぐ**必要がある。  
  → 単純な言語切り替えや、推測可能な同一URL内のパス（例: `/th/products`）で行き来できる設計は NG。

### 2. 方針：サブドメイン ＋ 初回選択の永続化（Cookie）

以下のように **サブドメインでオーディエンスを完全に分離**し、**初回のみ「日本語／ไทย」を選ばせ、その選択を Cookie で固定**する方式を推奨します。

- **メインドメイン（例: `example.com`）**
  - **役割**: ショップのコンテンツは一切出さない。
  - **表示**: 「日本語で見る」「ไทย」の 2 択のみのランディングページ。
  - **動作**:
    - いずれかをクリック → **永続 Cookie（例: `audience=ja` または `audience=th`）を設定**し、対応するサブドメインへ **301 リダイレクト**。
    - 既に Cookie を持っているユーザーがメインに来た場合 → その Cookie に従い、いきなり該当サブドメインへリダイレクト（選択画面をスキップ可）。

- **日本向けサブドメイン（例: `ja.example.com`）**
  - 日本向けコンテンツのみ。価格は **常に `price` / `sale_price` のみ**。`thai_price` は select もせず表示もしない。
  - ナビ・フッター・sitemap・内部リンクに **タイ向けサイトへのリンクは一切置かない**。
  - **Cookie チェック**: もし `audience=th` のユーザーがこのサブドメインに直で来た場合（URLを手入力した場合）→ `th.example.com` へリダイレクトし、**日本向け価格を見せない**。

- **タイ向けサブドメイン（例: `th.example.com`）**
  - タイ語 UI・タイ向け価格（`thai_price` および `price_variants[].thai_price`）のみ。`price` / `sale_price` はフロントでは取得・表示しない。
  - 日本向けサイトへのリンクは一切置かない。
  - **Cookie チェック**: `audience=ja` のユーザーが直で来た場合 → `ja.example.com` へリダイレクト。

これにより、

- 通常の利用では **一度選んだオーディエンスだけ**を見続ける。
- たとえ相手側の URL を知っていて手入力しても、**Cookie により「意図したオーディエンス」のサイトに戻す**ことで、**誤って別価格を見る時間を最小化**できる。
- サブドメインが違うため、**クローラー・sitemap・共有リンク**も「日本向け」「タイ向け」で自然に分離できる。

### 3. Accept-Language の扱い（任意）

- **メインドメインの初回表示**で、Accept-Language を見て「日本語」「ไทย」のどちらをデフォルト表示（ハイライト）するかや、リダイレクト候補を提案する程度に使うのは可。
- **振り分けの決定には Cookie を優先**し、**Accept-Language だけでは自動でサブドメインを切り替えない**ことを推奨。  
  （同じ端末を家族で使う場合など、ブラウザ言語と「買い手」が一致しない可能性があるため。）

### 4. 実装形態の選択肢

- **A. 単一 Next.js アプリでサブドメインを分岐（推奨）**
  - 1 リポジトリ・1 デプロイ。
  - リクエストの **Host ヘッダー**（と Cookie）で `ja` / `th` を判定。
  - ミドルウェアで:
    - メインドメイン → 選択ページ or Cookie に応じたサブドメインへリダイレクト。
    - `ja.*` → `audience=ja` を付与 or 検証し、`th` なら `th.*` へリダイレクト。
    - `th.*` → 同様に `audience=th` を付与 or 検証し、`ja` なら `ja.*` へリダイレクト。
  - アプリ内では **`NEXT_PUBLIC_AUDIENCE` は使わず、リクエストごとに Host ＋ Cookie から `audience` を決定**し、サーバー・クライアント両方で「今は ja か th か」を一貫して使う（Context や getServerSide の引数で渡す等）。
  - **メリット**: 1 コードベースで運用・デプロイが簡単。デザイン・レイアウトの共通化が容易。

- **B. ビルド時またはデプロイでオーディエンスを固定（別デプロイ）**
  - 例: `ja.example.com` 用と `th.example.com` 用で **別ビルド**（`NEXT_PUBLIC_AUDIENCE=ja` / `th`）あるいは別プロジェクトとしてデプロイ。
  - 各デプロイでは **もう一方のサブドメインの URL をコード・sitemap に一切含めない**。
  - メインドメインは別の最小アプリ（または A の「選択のみ」用ルート）で、「日本語」「ไทย」クリックでそれぞれのサブドメインへリダイレクト＋Cookie 設定。
  - **メリット**: 日本向けビルドにタイ向けのコード・価格が一切含まれないため、セキュリティ的に最も堅い。**デメリット**: ビルド・デプロイが 2 本立てになる。

### 5. データ層の設計（いずれも共通）

- **商品**
  - **日本向け**: 既存どおり `price`, `sale_price`, `price_variants`（`thai_price` は select しない）。RLS や View は必須ではないが、将来的に「anon で日本向けのみ見せる View」を張ることも可能。
  - **タイ向け**: `thai_price` および `price_variants[].thai_price` を **表示用の主価格**として取得。`price` / `sale_price` は **タイ向けのレスポンスには含めない**（API や select の段階で除外）。
  - 既存の `products` テーブルのままでよい。**別テーブル（例: products_th）は不要**。管理画面では従来どおり両方の価格を編集できるようにする。

- **注文**
  - `orders`（または `order_items`）に **`audience`（`ja` / `th`）を 1 カラム追加**することを推奨。どのサイトから発注したかの記録になり、レポート・返金・問い合わせ時の価格解釈に使える。
  - 保存する金額は「そのオーディエンスで表示した単価」のまま（日本向けサイトなら `price` 系、タイ向けなら `thai_price` 系）でよい。

- **送料・閾値**
  - `lib/shop-config.ts` の `FREE_SHIPPING_THRESHOLD_BAHT` / `DEFAULT_SHIPPING_FEE_BAHT` は現状のままでも可。必要なら後から `audience` ごとに定数を分ける。

### 6. セキュリティ・運用上の注意

- **サブドメイン間で Cookie を共有する場合**: ドメインを `example.com` に設定すれば `ja.example.com` / `th.example.com` 双方で `audience` を読める。メインで設定し、各サブドメインのミドルウェアで参照する。
- **検索エンジン**: `ja.example.com` 用と `th.example.com` 用で **別々の sitemap** を出し、それぞれに相手の URL を載せない。`robots.txt` もサブドメイン単位で問題なければそのままでよい。
- **リンク**: メール・LINE・SNS では、**日本向けには `ja.example.com` のみ**、**タイ向けには `th.example.com` のみ**を案内する。

---

## ステップ2 提案の要約

| 項目 | 内容 |
|------|------|
| **分離の単位** | サブドメイン（`ja.example.com` / `th.example.com`）＋ メインは選択のみ |
| **初回の決定** | メインで「日本語」「ไทย」を選ばせ、Cookie（`audience=ja|th`）で永続化 |
| **クロスアクセス** | 他方のサブドメインに来たら Cookie に従い自オーディエンスのサブドメインへリダイレクト |
| **価格の出し分け** | 日本向け: `price`/`sale_price` のみ取得・表示／タイ向け: `thai_price` のみ取得・表示 |
| **DB** | 既存 `products` のまま。注文に `audience` カラム追加を推奨 |
| **実装** | まずは **単一 Next.js で Host＋Cookie によるサブドメイン分岐（案 A）** を推奨。必要なら後に B（別デプロイ）へ移行可能 |

この内容で合意いただけたら、ステップ3 で「デザイン・レイアウトは現状を引き継ぎ、サブドメイン＋audience に沿った実装・タイ語テキスト・タイ向け価格の適用・スキーマ（audience 追加）」まで具体的な実装に落とし込みます。
