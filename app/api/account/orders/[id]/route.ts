import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "edge";

/**
 * ログイン中ユーザーの注文詳細を返す。
 * 本人確認: order_email_normalized または order_email が一致する場合のみ返す。
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
  }

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
    .select("id, status, total_amount, created_at, order_email_normalized")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const orderEmail = ((data as { order_email_normalized?: string | null }).order_email_normalized ?? "").toLowerCase();
  if (orderEmail && orderEmail !== emailNorm) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ order: data });
}
