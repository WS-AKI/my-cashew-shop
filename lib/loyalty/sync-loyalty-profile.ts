import type { SupabaseClient } from "@supabase/supabase-js";

export type VipTier = "normal" | "silver" | "gold";

const TIER_RANK: Record<VipTier, number> = {
  normal: 0,
  silver: 1,
  gold: 2,
};

function higherTier(a: VipTier, b: VipTier): VipTier {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

export function normalizeEmailForLoyalty(email: string): string {
  return email.trim().toLowerCase();
}

type ProfileRow = {
  id: string;
  vip_tier: VipTier;
  lifetime_spent_thb: number | null;
  email_normalized: string | null;
  auth_user_id: string | null;
};

type StagingRow = {
  id: string;
  initial_lifetime_spent_thb: number;
  initial_tier: VipTier;
};

async function fetchUnmergedStaging(
  service: SupabaseClient,
  emailNormalized: string,
): Promise<StagingRow | null> {
  const { data, error } = await service
    .from("loyalty_import_staging")
    .select("id, initial_lifetime_spent_thb, initial_tier")
    .eq("email_normalized", emailNormalized)
    .is("merged_profile_id", null)
    .order("imported_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as StagingRow;
}

/** 未マージの staging があればプロフィールに反映し staging をクローズ */
async function applyUnmergedStaging(
  service: SupabaseClient,
  emailNormalized: string,
  profileId: string,
  lifetime: number,
  tier: VipTier,
): Promise<{ lifetime_spent_thb: number; vip_tier: VipTier }> {
  const staging = await fetchUnmergedStaging(service, emailNormalized);
  if (!staging) {
    return { lifetime_spent_thb: lifetime, vip_tier: tier };
  }

  const nextLifetime = Math.max(lifetime, Number(staging.initial_lifetime_spent_thb ?? 0));
  const nextTier = higherTier(tier, staging.initial_tier as VipTier);

  const { error: upProf } = await service
    .from("loyalty_profiles")
    .update({
      lifetime_spent_thb: nextLifetime,
      vip_tier: nextTier,
    })
    .eq("id", profileId);

  if (upProf) {
    throw new Error(upProf.message);
  }

  const { error: upSt } = await service
    .from("loyalty_import_staging")
    .update({ merged_profile_id: profileId })
    .eq("id", staging.id);

  if (upSt) {
    throw new Error(upSt.message);
  }

  return { lifetime_spent_thb: nextLifetime, vip_tier: nextTier };
}

/**
 * JWT で検証済みの userId / email に対し loyalty_profiles を冪等に同期。
 * Service Role のみ呼び出すこと。
 */
export async function syncLoyaltyProfileForUser(
  service: SupabaseClient,
  userId: string,
  email: string,
): Promise<{ profileId: string; vipTier: VipTier }> {
  const emailNormalized = normalizeEmailForLoyalty(email);

  const { data: byAuth, error: e1 } = await service
    .from("loyalty_profiles")
    .select("id, vip_tier, lifetime_spent_thb, email_normalized, auth_user_id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (e1) {
    throw new Error(e1.message);
  }

  if (byAuth) {
    const row = byAuth as ProfileRow;
    if (row.email_normalized !== emailNormalized) {
      const { error: eEmail } = await service
        .from("loyalty_profiles")
        .update({ email_normalized: emailNormalized })
        .eq("id", row.id);
      if (eEmail) throw new Error(eEmail.message);
    }
    const merged = await applyUnmergedStaging(
      service,
      emailNormalized,
      row.id,
      Number(row.lifetime_spent_thb ?? 0),
      row.vip_tier as VipTier,
    );
    return { profileId: row.id, vipTier: merged.vip_tier };
  }

  const { data: byEmail, error: e2 } = await service
    .from("loyalty_profiles")
    .select("id, vip_tier, lifetime_spent_thb, email_normalized, auth_user_id")
    .eq("email_normalized", emailNormalized)
    .is("auth_user_id", null)
    .maybeSingle();

  if (e2) {
    throw new Error(e2.message);
  }

  if (byEmail) {
    const row = byEmail as ProfileRow;
    const { error: linkErr } = await service
      .from("loyalty_profiles")
      .update({ auth_user_id: userId })
      .eq("id", row.id);
    if (linkErr) throw new Error(linkErr.message);

    const merged = await applyUnmergedStaging(
      service,
      emailNormalized,
      row.id,
      Number(row.lifetime_spent_thb ?? 0),
      row.vip_tier as VipTier,
    );
    return { profileId: row.id, vipTier: merged.vip_tier };
  }

  const staging = await fetchUnmergedStaging(service, emailNormalized);
  if (staging) {
    const { data: inserted, error: insErr } = await service
      .from("loyalty_profiles")
      .insert({
        auth_user_id: userId,
        email_normalized: emailNormalized,
        vip_tier: staging.initial_tier,
        lifetime_spent_thb: Number(staging.initial_lifetime_spent_thb ?? 0),
      })
      .select("id, vip_tier")
      .single();

    if (insErr || !inserted) {
      throw new Error(insErr?.message ?? "loyalty_profiles insert failed");
    }

    const { error: stErr } = await service
      .from("loyalty_import_staging")
      .update({ merged_profile_id: inserted.id })
      .eq("id", staging.id);

    if (stErr) throw new Error(stErr.message);

    return { profileId: inserted.id as string, vipTier: inserted.vip_tier as VipTier };
  }

  const { data: fresh, error: ins2 } = await service
    .from("loyalty_profiles")
    .insert({
      auth_user_id: userId,
      email_normalized: emailNormalized,
      vip_tier: "normal",
      lifetime_spent_thb: 0,
    })
    .select("id, vip_tier")
    .single();

  if (ins2 || !fresh) {
    throw new Error(ins2?.message ?? "loyalty_profiles insert failed");
  }

  return { profileId: fresh.id as string, vipTier: fresh.vip_tier as VipTier };
}
