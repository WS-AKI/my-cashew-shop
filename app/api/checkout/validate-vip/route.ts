import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { canPurchaseVipProduct } from "@/lib/loyalty/vip-product-access";
import type { VipTier } from "@/lib/loyalty/sync-loyalty-profile";
import type { VipRequiredTier } from "@/types";

export const runtime = "edge";

type RequestBody = {
  items?: Array<{ productId?: string }>;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RequestBody;
  const ids = [...new Set((body.items ?? []).map((i) => i.productId).filter((v): v is string => typeof v === "string" && v.length > 0))];
  if (ids.length === 0) {
    return NextResponse.json({ ok: true, blockedProductIds: [] });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: "config_error" }, { status: 500 });
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
          // noop
        }
      },
    },
    auth: { detectSessionInUrl: false },
  });

  const {
    data: { session },
  } = await supabaseAuth.auth.getSession();
  const loggedIn = Boolean(session?.user?.id);

  let service;
  try {
    service = createServiceRoleClient();
  } catch {
    return NextResponse.json({ ok: false, error: "service_role_error" }, { status: 500 });
  }

  let vipTier: VipTier | null = null;
  if (loggedIn && session?.user?.id) {
    const { data } = await service
      .from("loyalty_profiles")
      .select("vip_tier")
      .eq("auth_user_id", session.user.id)
      .maybeSingle();
    const t = (data as { vip_tier?: string } | null)?.vip_tier;
    vipTier = t === "normal" || t === "silver" || t === "gold" ? t : "normal";
  }

  const { data: products, error } = await service
    .from("products")
    .select("id, is_active, vip_required_tier, is_gold_exclusive")
    .in("id", ids);

  if (error) {
    return NextResponse.json({ ok: false, error: "products_fetch_error" }, { status: 500 });
  }

  const map = new Map((products ?? []).map((p) => [String((p as { id: string }).id), p as { id: string; is_active?: boolean; vip_required_tier?: string | null; is_gold_exclusive?: boolean | null }]));
  const blockedProductIds: string[] = [];
  for (const id of ids) {
    const p = map.get(id);
    const requiredTier: VipRequiredTier | undefined =
      p?.vip_required_tier === "normal" ||
      p?.vip_required_tier === "silver" ||
      p?.vip_required_tier === "gold"
        ? p.vip_required_tier
        : undefined;
    const vipShape = p
      ? {
          vip_required_tier: requiredTier,
          is_gold_exclusive: Boolean(p.is_gold_exclusive),
        }
      : null;
    if (!p || p.is_active === false || !vipShape || !canPurchaseVipProduct(vipShape, vipTier, loggedIn)) {
      blockedProductIds.push(id);
    }
  }

  return NextResponse.json({ ok: blockedProductIds.length === 0, blockedProductIds });
}
