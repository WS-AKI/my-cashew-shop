# タイ人向け展開 実装メモ（ステップ3）

## アーキテクチャ概要

**案B（別ビルド・別デプロイ）**を採用。同一リポジトリから Cloudflare Pages で 2 プロジェクトを立ち上げる。

| プロジェクト | `NEXT_PUBLIC_AUDIENCE` | URL（例） |
|---|---|---|
| 日本向け | `ja` | `cashew-ja.pages.dev` |
| タイ向け | `th` | `cashew-th.pages.dev` |

`middleware.ts` は不要のため存在しない。`NEXT_PUBLIC_` プレフィックスによりビルド時に値が埋め込まれ、サーバー・クライアント両方で参照可能。

## 1. オーディエンスの判定

- **`lib/audience.ts`**: `getAudienceFromEnv()` のみ。`process.env.NEXT_PUBLIC_AUDIENCE` を読み、`ja` でなければ `th` を返す（フォールバック）。
- **`context/AudienceContext.tsx`**: `AudienceProvider` / `useAudience()`。Provider 外での呼び出しは `getAudienceFromEnv()` にフォールバック。
- **`app/layout.tsx`**: `getAudienceFromEnv()` を呼び、`AudienceProvider` でラップ。`<html lang>` と `metadata`（title/description）もビルド時に確定。`headers()` は不要で async も不要。

## 2. 価格の厳格な分離（データフェッチ）

- **`lib/products-fetch.ts`**:
  - **日本向け `fetchProductsForJa()`**: `products` から **`price`, `sale_price`, `price_variants`** のみ select。**`thai_price` は select せず**、`price_variants` からも `thai_price` を除去して返す。
  - **タイ向け `fetchProductsForTh()`**: **`price`, `sale_price` は select しない**。`thai_price` と `price_variants`（各要素の `thai_price`）のみ使用し、表示用に `price` にマッピングした `Product[]` を返す。
  - **`fetchProductsForAudience(audience)`**: 上記のいずれかを呼び分け。
- **`app/_components/ProductsGrid.tsx`**: 直接 Supabase を叩かず、`getAudienceFromHeaders(headers)` と `fetchProductsForAudience(audience)` のみで商品取得。日本向けサイトではタイ向け価格を一切取得しない。

## 3. 管理画面（商品のタイ向け価格）

- **`components/admin/ProductForm.tsx`**:
  - **基本**: フォームに `thai_price`（文字列）を追加。セット商品の場合は「タイ向け価格 (฿)」を 1 つ入力し、`payload.thai_price` として保存。
  - **バリアント**: `sizeThaiPrices`（サイズ別）を追加。サイズ別価格ブロックごとに「タイ向け価格 (฿)」を入力。`buildPriceVariants` の第 3 引数に `sizeThaiPrices` を渡し、各 `PriceVariant` に `thai_price` を含めて Supabase の `price_variants` JSONB に保存。
- 管理画面は **`/admin` 以下** のため、ミドルウェアのサブドメイン分岐対象外（Cookie は付与されるがリダイレクトはしない）。

## 4. 注文への audience 記録

- **DB**: `docs/add-orders-audience-column.sql` で `orders.audience`（text）を追加。値は `ja` / `th`。
- **`app/checkout/page.tsx`**: `useAudience()` で取得した `audience` を、注文 INSERT 用の全ペイロードバリアントに `audience` として付与。

## 5. UI のオーディエンス対応

- **ヘッダー**: `SHOP_TEXT.nav` の `ja`/`th` を `useAudience()` で切り替え。
- **商品カード・カート・チェックアウト・注文完了**: `SHOP_TEXT` の各キーで `T.xxx[audience]` を primary に、もう一方を secondary に表示。商品名・説明はタイ向け時は `name_th` / `description_th` を優先表示。
- **商品一覧ページ・ProductsGrid**: サーバーで `getAudienceFromHeaders` し、見出し・ラベルをオーディエンス別に表示。

## 6. sitemap・環境変数

- **`app/sitemap.ts`**: `headers()` なし・async なし。`NEXT_PUBLIC_SITE_URL`（ビルド時に確定）を base URL として使用。各プロジェクトに正しい URL を設定することで Google に別々にインデックスされる。
- **`.env.example`**: `NEXT_PUBLIC_AUDIENCE=th` を追記。`NEXT_PUBLIC_ROOT_DOMAIN` は不要（削除）。

## 7. 本番デプロイ時の注意

### Cloudflare Pages で 2 プロジェクトを作成する手順

1. Cloudflare ダッシュボード → **Workers & Pages** → **Connect to Git**。
2. 同じリポジトリを **2 回** 接続し、プロジェクト名を分ける（例: `cashew-ja` / `cashew-th`）。
3. 各プロジェクトの **Settings → Environment variables** で下記を設定する。

| 変数名 | 日本向けプロジェクト | タイ向けプロジェクト |
|---|---|---|
| `NEXT_PUBLIC_AUDIENCE` | `ja` | `th` |
| `NEXT_PUBLIC_SUPABASE_URL` | 共通 | 共通 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 共通 | 共通 |
| `NEXT_PUBLIC_SITE_URL` | `https://cashew-ja.pages.dev` | `https://cashew-th.pages.dev` |
| `LINE_CHANNEL_ACCESS_TOKEN` | 共通 | 共通 |
| `LINE_USER_ID` | 共通 | 共通 |

4. **DB**: `docs/add-orders-audience-column.sql` を Supabase で実行し、`orders.audience` を追加。
5. 既存商品にタイ向け価格が未設定の場合、タイ向けサイトでは `thai_price` が 0 または null になるため、**管理画面でタイ向け価格（商品・バリアント）を入力**すること。
6. ローカル開発では `.env.local` に `NEXT_PUBLIC_AUDIENCE=ja`（または `th`）を書いて切り替える。
