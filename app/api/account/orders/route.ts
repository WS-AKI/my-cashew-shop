import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "edge";

/**
 * ログイン中ユーザー自身の注文一覧を返す。
 * Supabase anon クライアントの orders RLS は INSERT/SELECT(anon) のみのため、
 * Service Role で email 照合してデータを返す。
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return NextResponse.json({ error: "設定エラー" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(url, anon, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch { /* Server Component */ }
      },
    },
    auth: { detectSessionInUrl: false },
  });

  const { data: { session } } = await supabaseAuth.auth.getSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }

  let service;
  try {
    service = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "サーバー設定エラー" }, { status: 500 });
  }

  const emailNorm = email.trim().toLowerCase();
  const { data, error } = await service
    .from("orders")
    .select("id, status, total_amount, created_at")
    .or(`order_email_normalized.eq.${emailNorm},order_email.ilike.${emailNorm}`)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
