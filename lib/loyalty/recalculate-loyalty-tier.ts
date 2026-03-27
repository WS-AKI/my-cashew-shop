import type { SupabaseClient } from "@supabase/supabase-js";

export type VipTier = "normal" | "silver" | "gold";

const TIER_RANK: Record<VipTier, number> = {
  normal: 0,
  silver: 1,
  gold: 2,
};

/** DB / 管理画面のステータス値に対応。paid_at があれば無条件で支払い済み扱い */
const PAID_STATUSES = new Set(["paid", "price_confirmed", "shipping", "delivered"]);

export function isOrderPaidForLoyalty(
  status: string | null | undefined,
  paidAt: string | null | undefined,
): boolean {
  if (paidAt) return true;
  const s = (status ?? "").toLowerCase();
  return PAID_STATUSES.has(s);
}

function tierFromLifetime(sum: number, silverTh: number, goldTh: number): VipTier {
  if (sum >= goldTh) return "gold";
  if (sum >= silverTh) return "silver";
  return "normal";
}

type ThresholdRow = {
  silver_lifetime_thb: number;
  gold_lifetime_thb: number;
  rank_period_days: number;
};

/**
 * 指定注文に紐づく loyalty_profile の累計（支払い済み注文）を再集計し、
 * lifetime_spent_thb / vip_tier を更新。昇格時は celebration とサイクル起点を更新。
 */
export async function recalculateLoyaltyTierForOrder(
  supabase: SupabaseClient,
  orderId: string,
): Promise<{ ok: true; skipped?: string; profileId?: string; newTier?: VipTier } | { ok: false; error: string }> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, loyalty_profile_id, status, paid_at, total_amount")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) {
    return { ok: false, error: orderErr.message };
  }
  if (!order) {
    return { ok: false, error: "注文が見つかりません" };
  }

  const profileId = order.loyalty_profile_id as string | null;
  if (!profileId) {
    return { ok: true, skipped: "no_loyalty_profile" };
  }

  const [{ data: th, error: thErr }, { data: profile, error: profErr }, { data: orderRows, error: sumErr }] =
    await Promise.all([
      supabase.from("vip_program_thresholds").select("silver_lifetime_thb, gold_lifetime_thb, rank_period_days").eq("id", 1).maybeSingle(),
      supabase.from("loyalty_profiles").select("id, vip_tier").eq("id", profileId).maybeSingle(),
      supabase.from("orders").select("total_amount, status, paid_at").eq("loyalty_profile_id", profileId),
    ]);

  if (thErr || !th) {
    return { ok: false, error: thErr?.message ?? "vip_program_thresholds を取得できません" };
  }
  if (profErr || !profile) {
    return { ok: false, error: profErr?.message ?? "loyalty_profiles が見つかりません" };
  }
  if (sumErr) {
    return { ok: false, error: sumErr.message };
  }

  const thresholds = th as ThresholdRow;
  const silverTh = Number(thresholds.silver_lifetime_thb);
  const goldTh = Number(thresholds.gold_lifetime_thb);
  const periodDays = Number(thresholds.rank_period_days) || 365;

  const rows = (orderRows ?? []) as { total_amount: number | null; status: string | null; paid_at: string | null }[];
  let lifetimeSum = 0;
  for (const r of rows) {
    if (!isOrderPaidForLoyalty(r.status, r.paid_at)) continue;
    lifetimeSum += Number(r.total_amount ?? 0);
  }

  const oldTier = profile.vip_tier as VipTier;
  const newTier = tierFromLifetime(lifetimeSum, silverTh, goldTh);
  const upgraded = TIER_RANK[newTier] > TIER_RANK[oldTier];

  const now = new Date();
  const expires = new Date(now.getTime() + periodDays * 86_400_000);

  const baseUpdate: Record<string, unknown> = {
    lifetime_spent_thb: lifetimeSum,
    vip_tier: newTier,
  };

  if (upgraded) {
    baseUpdate.celebration_pending_tier = newTier;
    baseUpdate.tier_cycle_started_at = now.toISOString();
    baseUpdate.tier_expires_at = expires.toISOString();
  }

  const { error: updErr } = await supabase.from("loyalty_profiles").update(baseUpdate).eq("id", profileId);

  if (updErr) {
    return { ok: false, error: updErr.message };
  }

  return { ok: true, profileId, newTier };
}

/**
 * 手動調整（システム外売上の加算/減算）で lifetime_spent_thb を更新し、
 * VIPランクを再判定する。delta は負数可。
 */
export async function adjustLoyaltyLifetimeByAmount(
  supabase: SupabaseClient,
  profileId: string,
  deltaThb: number,
): Promise<
  | { ok: true; oldLifetime: number; newLifetime: number; oldTier: VipTier; newTier: VipTier }
  | { ok: false; error: string }
> {
  const [{ data: th, error: thErr }, { data: profile, error: profErr }] = await Promise.all([
    supabase
      .from("vip_program_thresholds")
      .select("silver_lifetime_thb, gold_lifetime_thb, rank_period_days")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("loyalty_profiles")
      .select("id, vip_tier, lifetime_spent_thb, celebration_pending_tier")
      .eq("id", profileId)
      .maybeSingle(),
  ]);

  if (thErr || !th) {
    return { ok: false, error: thErr?.message ?? "vip_program_thresholds を取得できません" };
  }
  if (profErr || !profile) {
    return { ok: false, error: profErr?.message ?? "loyalty_profiles が見つかりません" };
  }

  const thresholds = th as ThresholdRow;
  const silverTh = Number(thresholds.silver_lifetime_thb);
  const goldTh = Number(thresholds.gold_lifetime_thb);
  const periodDays = Number(thresholds.rank_period_days) || 365;

  const oldLifetime = Number(profile.lifetime_spent_thb ?? 0);
  const newLifetime = Math.max(0, oldLifetime + deltaThb);
  const oldTier = profile.vip_tier as VipTier;
  const newTier = tierFromLifetime(newLifetime, silverTh, goldTh);

  const now = new Date();
  const expires = new Date(now.getTime() + periodDays * 86_400_000);

  const update: Record<string, unknown> = {
    lifetime_spent_thb: newLifetime,
    vip_tier: newTier,
  };

  const changed = newTier !== oldTier;
  const upgraded = TIER_RANK[newTier] > TIER_RANK[oldTier];
  const downgraded = TIER_RANK[newTier] < TIER_RANK[oldTier];

  if (upgraded) {
    update.celebration_pending_tier = newTier;
    update.tier_cycle_started_at = now.toISOString();
    update.tier_expires_at = expires.toISOString();
  } else if (downgraded) {
    // 降格時はお祝いフラグを解除し、ランク状態に合わせてサイクルを再設定
    update.celebration_pending_tier = null;
    if (newTier === "normal") {
      update.tier_cycle_started_at = null;
      update.tier_expires_at = null;
    } else {
      update.tier_cycle_started_at = now.toISOString();
      update.tier_expires_at = expires.toISOString();
    }
  } else if (!changed) {
    // ランク据え置き時は既存フラグを尊重（何も触らない）
  }

  const { error: updErr } = await supabase.from("loyalty_profiles").update(update).eq("id", profileId);
  if (updErr) {
    return { ok: false, error: updErr.message };
  }

  return { ok: true, oldLifetime, newLifetime, oldTier, newTier };
}
