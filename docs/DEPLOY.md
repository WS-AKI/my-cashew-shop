# デプロイ手順（Cloudflare）

## 推奨コマンド

```bash
npm run deploy
```

このコマンドが **ビルド → デプロイ** をまとめて実行します。

## Cloudflare Workers に必要な環境変数（本番）

デプロイ後に **管理画面・お知らせ・ログイン** が動くには、対象 Worker の **Settings → Variables**（または `wrangler secret put`）で次を揃えてください。

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL（https） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public キー |
| `SUPABASE_SERVICE_ROLE_KEY` | お知らせ保存・画像アップロード・一部 API（**サーバーのみ**） |
| `ADMIN_PIN` | 注文管理ログイン・お知らせ API・`/api/admin/ping` と**同じ値**（シークレット推奨） |

`wrangler.jsonc` の `vars` に無い変数は、ダッシュボードで設定するか `npx wrangler secret put 変数名` で登録します。`ADMIN_PIN` はコードに埋め込まず、**.env.local と Cloudflare で同じ値**にしてください。

## よくあるエラーと対処

### 1. `The entry-point file at ".open-next/worker.js" was not found`

**原因:** `npx wrangler deploy` を単体で実行していると、ビルドが走らず `worker.js` が存在しません。

**対処:**
- **必ず** `npm run deploy` を使う（ビルド＋デプロイが一度に実行されます）
- または先にビルドしてからデプロイする:
  ```bash
  npm run build:opennext
  npm run deploy:only
  ```

### 2. ビルド時の `Comparison with -0 using the "===" operator` 警告

**原因:** 依存パッケージ（バンドル内）のコードによるもので、プロジェクトのソースが原因ではありません。

**対処:** 無視して問題ありません。デプロイや動作には影響しません。

### 3. 開発時の `Fast Refresh had to perform a full reload`

**原因:** Next.js の開発モードで、一部モジュールの変更やランタイムエラーによりフルリロードが走った場合に出ます。

**対処:** 通常は一度リロードすれば解消します。同じ画面で繰り返し出る場合は、ブラウザコンソールのエラー内容を確認してください。
