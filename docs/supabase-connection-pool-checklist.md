# Supabase Connection Pool Checklist

CPU スパイクと接続枯渇を防ぐための本番チェック項目です。

## 1) Pooling を有効化

- Supabase Dashboard -> `Settings` -> `Database` -> `Connection pooling`
- `Shared pooler` を ON
- アプリは可能な限り短いクエリにする（本リポジトリでは ISR + timeout を追加済み）

## 2) Slow Query 監視

- Supabase Dashboard -> `Reports` -> `Query Performance`
- 200ms 超のクエリを優先改善
- 目標: 95% のクエリを 100ms 未満

## 3) 必須インデックス

- `orders(order_email_normalized)`
- `orders(created_at desc)`
- `products(vip_required_tier) where vip_required_tier <> 'normal'`

## 4) 運用ルール

- 管理画面の検索は email フィルタを優先
- 一覧系ページは ISR（`revalidate=60`）を維持
- 「全件取得」は避け、必ず `limit/range` を使う
