import { NextResponse } from "next/server";
import { adminPinAuthErrorResponse } from "@/lib/admin-api-auth";
import { isAdminLoyaltyTestApiEnabled } from "@/lib/admin-loyalty-test-guard";
import { createServiceRoleClient } from "@/lib/supabase/service-role";


type UserRow = {
  id: string;
  email_normalized: string | null;
  vip_tier: "normal" | "silver" | "gold";
  updated_at: string | null;
};

export async function GET(request: Request) {
  const authErr = adminPinAuthErrorResponse(request);
  if (authErr) return authErr;
  if (!isAdminLoyaltyTestApiEnabled()) {
    return NextResponse.json(
      { error: "VIP 検証 API は無効です。ENABLE_ADMIN_LOYALTY_TEST_TOOLS=true の環境でのみ利用できます。" },
      { status: 403 },
    );
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `サーバー設定: ${msg}` }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("loyalty_profiles")
    .select("id, email_normalized, vip_tier, updated_at")
    .not("email_normalized", "is", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = ((data ?? []) as UserRow[]).filter((r) => Boolean(r.email_normalized));
  return NextResponse.json({ ok: true, users: rows });
}
