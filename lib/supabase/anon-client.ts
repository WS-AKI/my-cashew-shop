/**
 * Cookie なし・認証なしの公開読み取り専用 Supabase クライアント。
 * products / announcements など RLS で anon SELECT を許可している公開データのみ使用可。
 *
 * ISR ページ（revalidate）や静的生成ページでは createClient（cookies()依存）を
 * 使えないため、こちらを使う。
 * Cloudflare Workers では isolate ごとにモジュールが再評価されるため
 * モジュールスコープに置いても実質 1 リクエスト 1 インスタンスになる。
 */

import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAnonClient() {
  if (_client) return _client;

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。");
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return _client;
}
