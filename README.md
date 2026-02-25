This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare

このプロジェクトは **Cloudflare Workers / Pages** でデプロイします。OpenNext の Cloudflare アダプターを使用しています。

- **GitHub に push したら Cloudflare を自動更新したい**: Cloudflare ダッシュボードで **Workers & Pages** → **Connect to Git** からこのリポジトリを接続してください。接続後は push のたびに自動でビルド・デプロイされます。
- **Vercel は使わない**: Vercel ダッシュボードで該当プロジェクトの **Settings** → **Git** → **Disconnect** でリポジトリとの連携を解除してください。
- 詳細な手順・ビルドコマンド: [docs/cloudflare-pages-migration.md](docs/cloudflare-pages-migration.md)
- コマンドラインから: `npx wrangler login` のあと `npm run deploy`。
- 環境変数（Supabase、LINE、サイトURL など）は Cloudflare の **Workers & Pages** → 対象プロジェクト → **Settings** → **Environment variables** で設定してください。
