import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** ビルド時（prerender）では環境変数が無くても throw せずプレースホルダーでクライアントを返す。本番では Cloudflare の環境変数を設定すること。 */
export async function createClient() {
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
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component から呼ばれた場合は set を無視
        }
      },
    },
  });
}
