import { NextResponse } from "next/server";
import { adminPinAuthErrorResponse } from "@/lib/admin-api-auth";
import { isAdminLoyaltyTestApiEnabled } from "@/lib/admin-loyalty-test-guard";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { adjustLoyaltyLifetimeByAmount } from "@/lib/loyalty/recalculate-loyalty-tier";


type Tier = "normal" | "silver" | "gold";
type CelebrationTier = "silver" | "gold" | null;
type Action =
  | "get_profile"
  | "set_celebration"
  | "clear_celebration"
  | "set_tier"
  | "add_lifetime_adjustment";

type Body = {
  action?: Action;
  email?: string;
  tier?: Tier;
  celebrationTier?: CelebrationTier;
  lifetimeSpentThb?: number;
  adjustmentThb?: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getProfileByEmail(emailNormalized: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("loyalty_profiles")
    .select("id, email_normalized, auth_user_id, vip_tier, lifetime_spent_thb, celebration_pending_tier, tier_cycle_started_at, tier_expires_at, updated_at")
    .eq("email_normalized", emailNormalized)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "指定メールの loyalty_profiles が見つかりません。" };
  return { ok: true as const, profile: data };
}

export async function POST(request: Request) {
  const authErr = adminPinAuthErrorResponse(request);
  if (authErr) return authErr;
  if (!isAdminLoyaltyTestApiEnabled()) {
    return NextResponse.json(
      { error: "VIP 検証 API は無効です。ENABLE_ADMIN_LOYALTY_TEST_TOOLS=true の環境でのみ利用できます。" },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action;
  const emailRaw = body.email ?? "";
  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });
  if (!emailRaw.trim()) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const email = normalizeEmail(emailRaw);

  const found = await getProfileByEmail(email);
  if (!found.ok) return NextResponse.json({ error: found.error }, { status: 404 });

  const supabase = createServiceRoleClient();
  const profileId = found.profile.id as string;

  if (action === "get_profile") {
    return NextResponse.json({ ok: true, profile: found.profile });
  }

  if (action === "set_celebration") {
    const c = body.celebrationTier;
    if (c !== "silver" && c !== "gold") {
      return NextResponse.json({ error: "celebrationTier must be silver or gold" }, { status: 400 });
    }
    const { error } = await supabase
      .from("loyalty_profiles")
      .update({
        celebration_pending_tier: c,
        vip_tier: c, // 表示齟齬を防ぐため tier も合わせる
      })
      .eq("id", profileId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (action === "clear_celebration") {
    const { error } = await supabase
      .from("loyalty_profiles")
      .update({ celebration_pending_tier: null })
      .eq("id", profileId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (action === "set_tier") {
    const tier = body.tier;
    if (tier !== "normal" && tier !== "silver" && tier !== "gold") {
      return NextResponse.json({ error: "tier must be normal|silver|gold" }, { status: 400 });
    }
    const patch: Record<string, unknown> = { vip_tier: tier };
    if (typeof body.lifetimeSpentThb === "number" && Number.isFinite(body.lifetimeSpentThb)) {
      patch.lifetime_spent_thb = Math.max(0, body.lifetimeSpentThb);
    }
    const { error } = await supabase.from("loyalty_profiles").update(patch).eq("id", profileId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (action === "add_lifetime_adjustment") {
    if (typeof body.adjustmentThb !== "number" || !Number.isFinite(body.adjustmentThb)) {
      return NextResponse.json({ error: "adjustmentThb must be a finite number" }, { status: 400 });
    }
    const result = await adjustLoyaltyLifetimeByAmount(supabase, profileId, body.adjustmentThb);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  const latest = await getProfileByEmail(email);
  if (!latest.ok) return NextResponse.json({ ok: true, profile: null });
  return NextResponse.json({ ok: true, profile: latest.profile });
}
