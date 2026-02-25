# LINE 通知の設定（2段階）

注文受付時とスリップアップロード時に、管理者のLINEへ Push 通知が届くようにするための設定です。

## 必要な値

- **LINE_CHANNEL_ACCESS_TOKEN** … LINE Developers で発行したチャネルのアクセストークン（長期）
- **LINE_USER_ID** … 通知を受け取る管理者の LINE User ID（例: `U070d1e7763a1f1973b49105ca1cb41f6`）

## ローカル開発

1. `.env.example` をコピーして `.env.local` を作成
2. `.env.local` に次を記入（値は実際のトークン・User ID に置き換え）

```env
LINE_CHANNEL_ACCESS_TOKEN=あなたのチャネルアクセストークン
LINE_USER_ID=管理者のLINEユーザーID
```

3. `npm run dev` を再起動

## Cloudflare（本番）

**Workers / Pages のダッシュボード**

- **Settings** → **Variables and Secrets** で以下を追加
  - `LINE_CHANNEL_ACCESS_TOKEN`（Secret として設定推奨）
  - `LINE_USER_ID`

**wrangler でデプロイする場合**

```bash
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
# プロンプトでトークンを貼り付け

npx wrangler secret put LINE_USER_ID
# プロンプトで User ID を貼り付け
```

※ トークンと User ID は **wrangler.jsonc に直接書かず**、必ず Secret またはダッシュボードの Variables で設定してください。

## 通知のタイミング

| タイミング           | メッセージ例 |
|----------------------|--------------|
| 注文確定時           | 📩 新規注文がありました（注文ID・お名前・合計） |
| スリップアップロード時 | 🧾 スリップがアップロードされました |
