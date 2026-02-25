# Cloudflare Workers / Pages でのデプロイ

本プロジェクトは **Cloudflare** にデプロイする想定です。Next.js を **OpenNext の Cloudflare アダプター** で Cloudflare Workers / Pages で動かすための設定です（`@cloudflare/next-on-pages` は非推奨のため使用していません）。

---

## GitHub にプッシュしたら Cloudflare が自動で更新されるようにする

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. **GitHub** を選び、リポジトリ（例: `WS-AKI/my-cashew-shop`）とブランチ（例: `main`）を指定
4. **Build configuration** で次を設定：
   - **Framework preset**: None（または Next.js があれば選択）
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Build output directory**: 空欄のまま（OpenNext が自動で出力先を扱います）
5. **Environment variables** で本番用の変数（`NEXT_PUBLIC_SUPABASE_URL` など）を追加
6. **Save** 後、以降は **main に push するたびに Cloudflare が自動でビルド・デプロイ**されます。

※ 初回は「Deploy with Workers」のような案内が出る場合があります。その手順に従って Workers として接続すれば、同じく push で自動デプロイされます。

---

## Vercel と GitHub の連携を切る（Vercel を使わない場合）

Vercel を使わない場合は、リポジトリとの連携を解除してください。

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 該当プロジェクト（my-cashew-shop など）を開く
3. **Settings** → **Git** の項目へ
4. **Disconnect**（Git リポジトリとの接続を解除）を実行

これで、GitHub に push しても Vercel にはデプロイされません。Cloudflare 側で上記のとおり Git 連携をしていれば、push は Cloudflare にだけ反映されます。

---

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

## 公式LINEのQR画像を差し替える

フッターで表示している公式LINEのQRは `public/line-official-qr.png` です。新しいQRに差し替える場合は、このファイルを新しい画像で**上書き保存**（ファイル名は `line-official-qr.png` のまま）し、コミット・プッシュしてください。
