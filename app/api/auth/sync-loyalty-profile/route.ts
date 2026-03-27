import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  getRecentLoyaltySyncResponse,
  setRecentLoyaltySyncResponse,
} from "@/lib/edge-loyalty-sync-coalesce";
import { syncLoyaltyProfileForUser } from "@/lib/loyalty/sync-loyalty-profile";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Cloudflare Workers（OpenNext）で Node.js ポリフィルを避け CPU を抑えるため edge 指定。
// cookies() は @supabase/ssr が Edge でも対応している。
export const runtime = "edge";

/**
 * Cookie セッションでユーザーを検証し、Service Role で loyalty_profiles を同期（マージ／新規）。
 * getUser() は使わず getSession() のみ（Auth API 往復を避ける）。
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return NextResponse.json({ error: "Supabase の公開環境変数が未設定です。" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Server Component 経由時は無視 */
        }
      },
    },
    auth: { detectSessionInUrl: false },
  });

  const {
    data: { session },
    error: sessionErr,
  } = await supabaseAuth.auth.getSession();

  const user = session?.user ?? null;
  if (sessionErr || !user?.email) {
    return NextResponse.json({ error: "認証されていません。" }, { status: 401 });
  }

  const now = Date.now();
  const replay = getRecentLoyaltySyncResponse(user.id, now);
  if (replay) {
    return NextResponse.json(replay);
  }

  let service;
  try {
    service = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `サーバー設定: ${msg}` }, { status: 500 });
  }

  try {
    const { profileId, vipTier } = await syncLoyaltyProfileForUser(service, user.id, user.email);

    const { data: prof, error: profErr } = await service
      .from("loyalty_profiles")
      .select("vip_tier, celebration_pending_tier, lifetime_spent_thb")
      .eq("id", profileId)
      .maybeSingle();

    if (profErr || !prof) {
      const payload = {
        ok: true,
        profileId,
        vipTier,
        celebrationPendingTier: null,
        lifetimeSpentThb: 0,
      };
      setRecentLoyaltySyncResponse(user.id, payload, now);
      return NextResponse.json(payload);
    }

    const row = prof as {
      vip_tier: string;
      celebration_pending_tier: string | null;
      lifetime_spent_thb: number | null;
    };

    const payload = {
      ok: true,
      profileId,
      vipTier: row.vip_tier ?? vipTier,
      celebrationPendingTier: row.celebration_pending_tier ?? null,
      lifetimeSpentThb: Number(row.lifetime_spent_thb ?? 0),
    };
    setRecentLoyaltySyncResponse(user.id, payload, now);
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
