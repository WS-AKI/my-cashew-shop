import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/**
 * 同一リクエスト内で複数回 createClient() しても、インスタンスと Cookie 読み取りを一度にまとめる（RSC + 子コンポーネントの二重生成対策）。
 * URL フラグメントからのセッション検出はサーバーでは不要なのでオフにし、初期化コストを抑える。
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();
  const url = SUPABASE_URL || "https://placeholder.supabase.co";
  const key = SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component から呼ばれた場合は set を無視
        }
      },
    },
    auth: {
      detectSessionInUrl: false,
    },
  });
});
