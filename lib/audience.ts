/**
 * オーディエンス（日本向け / タイ向け）の判定。
 * ビルド時環境変数 NEXT_PUBLIC_AUDIENCE で完全に固定される。
 *
 *   NEXT_PUBLIC_AUDIENCE=ja  → 日本向けビルド（cashew-ja.pages.dev 等）
 *   NEXT_PUBLIC_AUDIENCE=th  → タイ向けビルド（cashew-th.pages.dev 等）
 *   未設定                   → th（フォールバック）
 *
 * NEXT_PUBLIC_ プレフィックスにより、サーバー・クライアント両方で参照可能。
 */

export type Audience = "ja" | "th";

export const AUDIENCE_JA: Audience = "ja";
export const AUDIENCE_TH: Audience = "th";

/**
 * ビルド時環境変数 NEXT_PUBLIC_AUDIENCE からオーディエンスを取得。
 * サーバーコンポーネント・クライアントコンポーネント・API Route のいずれでも使用可。
 */
export function getAudienceFromEnv(): Audience {
  const v = process.env.NEXT_PUBLIC_AUDIENCE;
  if (v === "ja") return "ja";
  return "th"; // th がデフォルト
}
