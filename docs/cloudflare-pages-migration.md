# Cloudflare Workers / Pages でのデプロイ

本プロジェクトは **Cloudflare** にデプロイする想定です。Next.js を **OpenNext の Cloudflare アダプター** で Cloudflare Workers / Pages で動かすための設定です（`@cloudflare/next-on-pages` は非推奨のため使用していません）。

## 1. 必要なライブラリのインストール

```bash
npm install @opennextjs/cloudflare@latest
npm install --save-dev wrangler@latest
```

- **Wrangler** は 3.99.0 以上が必要です。
- 既存の `next build` はそのまま利用され、`opennextjs-cloudflare build` が内部で `next build` を実行します。

## 2. 作成・修正したファイル

| ファイル | 内容 |
|----------|------|
| `wrangler.jsonc` | Cloudflare Worker の設定（main, assets, nodejs_compat 等） |
| `open-next.config.ts` | OpenNext Cloudflare 用の設定（必要に応じて R2 キャッシュ等を追加可能） |
| `.dev.vars` | ローカル開発用の環境変数（`NEXTJS_ENV=development`） |
| `public/_headers` | 静的アセットのキャッシュヘッダー（`/_next/static/*`） |
| `next.config.ts` | 末尾に `initOpenNextCloudflareForDev()` を追加 |
| `package.json` | `preview`, `deploy`, `upload`, `cf-typegen` スクリプトを追加 |
| `.gitignore` | `.open-next` を追加 |

## 3. 利用可能な npm スクリプト

- **`npm run dev`** … 従来どおり Next.js のローカル開発（`next dev`）
- **`npm run build`** … Next.js のビルドのみ（`next build`）
- **`npm run preview`** … OpenNext でビルドし、ローカルで Cloudflare ランタイムをプレビュー
- **`npm run deploy`** … OpenNext でビルドし、Cloudflare にデプロイ
- **`npm run upload`** … ビルドして Cloudflare にアップロード（バージョンのみ、即時公開はしない）
- **`npm run cf-typegen`** … `cloudflare-env.d.ts` を生成（bindings の型用）

## 4. Cloudflare ダッシュボードでの設定（Git 連携で Pages にする場合）

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. リポジトリを選択し、ビルド設定を次のようにする場合の例：
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Build output directory**: 出力は Worker 用のため、通常は「Build output directory」は空欄またはドキュメントの推奨に従う（Git 連携の場合は OpenNext のドキュメントを確認）
3. 環境変数（`NEXT_PUBLIC_SUPABASE_URL` など）は **Settings** → **Environment variables** で設定。

※ Git 連携では、多くの場合 **Workers** としてデプロイする手順が案内されます。OpenNext の「Deploy to Cloudflare Workers」の項を参照してください。

## 5. コマンドラインからデプロイする場合

1. [Wrangler ログイン](https://developers.cloudflare.com/workers/wrangler/install-and-update/#login): `npx wrangler login`
2. デプロイ: `npm run deploy`

## 6. 注意事項

- **Edge Runtime**（`export const runtime = "edge"`）は OpenNext Cloudflare では未対応のため、使用している場合は削除してください。このプロジェクトでは未使用です。
- 画像最適化は `wrangler.jsonc` の `images.binding` で有効にしています（必要に応じて R2 等をバインド可能。公式 Howto 参照）。
- キャッシュを R2 で行う場合は、[OpenNext の Caching ドキュメント](https://opennext.js.org/cloudflare/caching) を参照し、`open-next.config.ts` と `wrangler.jsonc` に R2 バインディングを追加します。
