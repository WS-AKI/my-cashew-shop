import { NextResponse } from "next/server";
import { adminPinAuthErrorResponse } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { recalculateLoyaltyTierForOrder } from "@/lib/loyalty/recalculate-loyalty-tier";

/**
 * 管理PIN必須。Service Role のみ loyalty_profiles を更新可能。
 * body: { orderId: string }
 */
export async function POST(request: Request) {
  const authErr = adminPinAuthErrorResponse(request);
  if (authErr) return authErr;

  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `サーバー設定: ${msg}` }, { status: 500 });
  }

  const result = await recalculateLoyaltyTierForOrder(supabase, orderId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    skipped: result.skipped,
    profileId: result.profileId,
    newTier: result.newTier,
  });
}
