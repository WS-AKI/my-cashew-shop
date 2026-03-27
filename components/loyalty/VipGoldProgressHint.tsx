"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import { useAudience } from "@/context/AudienceContext";
import { SHOP_TEXT } from "@/lib/shop-config";

type Props = {
  cartSubtotalBaht: number;
};

export default function VipGoldProgressHint({ cartSubtotalBaht }: Props) {
  const audience = useAudience();
  const auth = useAuthSessionOptional();
  const [goldTh, setGoldTh] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("vip_program_thresholds")
          .select("gold_lifetime_thb")
          .eq("id", 1)
          .maybeSingle();
        if (cancelled || error || !data) return;
        const n = Number((data as { gold_lifetime_thb: number }).gold_lifetime_thb);
        if (Number.isFinite(n) && n > 0) setGoldTh(n);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!auth?.user || goldTh == null) return null;
  if (auth.loading) return null;
  if (auth.vipTier === "gold") return null;

  const lifetime = auth.lifetimeSpentThb ?? 0;
  const combined = lifetime + cartSubtotalBaht;
  const remaining = Math.max(0, goldTh - combined);
  const pct = Math.min(100, (combined / goldTh) * 100);

  const V = SHOP_TEXT.vip;
  const msg =
    remaining > 0
      ? V.cartGoldProgress[audience].replace("{amount}", remaining.toLocaleString())
      : V.cartGoldReached[audience];

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-amber-100/80 bg-white/60 px-4 py-4 backdrop-blur-sm">
      <p className="text-center text-[11px] sm:text-xs font-light leading-relaxed tracking-wide text-amber-900/55">
        {msg}
      </p>
      <div className="h-px w-full overflow-hidden rounded-full bg-amber-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-200/80 via-amber-400/50 to-amber-600/40 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
