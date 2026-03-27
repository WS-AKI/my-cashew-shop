# SAM SIAN ELIXIR - Coming Soon Landing Page

高級ブランド「SAM SIAN ELIXIR」の「Coming Soon」ランディングページ用のCloudflare Workerスクリプトです。

## 特徴

- **Basic認証**: 内部テスト用の認証機能（ユーザー名: `admin`, パスワード: `secret2026`）
- **極小主義デザイン**: シャネル風の洗練されたデザイン
- **単一ファイル**: すべてのロジックとHTML/CSSが1つのファイルに含まれています

## セットアップ

### 1. 画像の設定

`index.js`ファイル内の`HERO_IMAGE_URL`を更新してください：

```javascript
const HERO_IMAGE_URL = 'https://your-image-url.com/image_3.png';
```

または、画像をCloudflare Workers Assetsにアップロードして相対パスを使用することもできます。

### 2. 認証情報の変更（オプション）

`index.js`ファイル内の認証情報を変更できます：

```javascript
const AUTH_USERNAME = 'your-username';
const AUTH_PASSWORD = 'your-password';
```

### 3. デプロイ

```bash
# 開発環境でテスト
wrangler dev --config wrangler.coming-soon.jsonc

# 本番環境にデプロイ
wrangler deploy --config wrangler.coming-soon.jsonc
```

## 使用方法

1. ブラウザでWorkerのURLにアクセス
2. Basic認証のダイアログが表示されます
3. ユーザー名とパスワードを入力（デフォルト: `admin` / `secret2026`）
4. 「Coming Soon」ページが表示されます

## デザイン

- **カラーパレット**: 黒（#000000）、白（#FFFFFF）、ピンクゴールド（#E6C7C2）
- **タイポグラフィ**: 
  - 日本語: Noto Serif JP（薄い明朝体）
  - 英語: Inter（サンセリフ）
- **レイアウト**: 極小主義、余白を重視したデザイン

## ファイル構成

- `index.js`: メインのWorkerスクリプト（認証ロジックとHTML/CSSを含む）
- `wrangler.coming-soon.jsonc`: Cloudflare Workers設定ファイル
