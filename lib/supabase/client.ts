import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** ビルド時（SSR/prerender）では環境変数が無くても throw せずプレースホルダーでクライアントを返す。ブラウザで未設定のときだけエラーにする。 */
export function createClient() {
  if (typeof window !== "undefined" && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
    throw new Error(
      "Supabase の環境変数が設定されていません。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定し、開発サーバーを再起動してください。"
    );
  }
  const url = SUPABASE_URL || "https://placeholder.supabase.co";
  const key = SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, key);
}
