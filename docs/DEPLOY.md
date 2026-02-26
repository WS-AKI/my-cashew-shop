# デプロイ手順（Cloudflare）

## 推奨コマンド

```bash
npm run deploy
```

このコマンドが **ビルド → デプロイ** をまとめて実行します。

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
