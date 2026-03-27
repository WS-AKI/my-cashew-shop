"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthSession } from "@/context/AuthSessionContext";
import { useAudience } from "@/context/AudienceContext";
import { SHOP_TEXT } from "@/lib/shop-config";
const INV_BASE = "/vip";

const COPY = {
  silver: {
    headline: "Welcome to Silver Status.",
    subJa: "Sam Sian Cashew Nuts のシルバー会員として、特別なおもてなしをご用意しております。",
    subTh: "ในฐานะสมาชิก Silver ของ Sam Sian เรามอบสิทธิพิเศษเพื่อคุณโดยเฉพาะ",
    perkJa:
      "限定フレーバーやセットの先行案内、さらにゴールド会員向けレア商品（ジャム等）への道がひらけます。静かに、長くお付き合いくださいませ。",
    perkTh: "รับข่าวสารรสชาติพิเศษและเซ็ตก่อนใคร พร้อมเส้นทางสู่สินค้าหายากสำหรับสมาชิกโกลด์",
  },
  gold: {
    headline: "Welcome to Gold Status.",
    subJa: "最上級のお客様として、心を込めてお迎えいたします。",
    subTh: "เรายินดีต้อนรับคุณในฐานะแขกระดับสูงสุดของเรา",
    perkJa:
      "ゴールド会員限定商品（No.0・ジャムなど）のご購入権、優先的なご案内をお約束いたします。",
    perkTh: "สิทธิ์ซื้อสินค้าพิเศษสำหรับโกลด์ (No.0, แยม ฯลฯ) และการแจ้งข่าวก่อนใคร",
  },
} as const;

export default function TierCelebrationModal() {
  const audience = useAudience();
  const router = useRouter();
  const { celebrationPendingTier, loading, refreshLoyalty } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const [busy, setBusy] = useState(false);

  const tier = celebrationPendingTier;

  useEffect(() => {
    if (loading || !tier) {
      setOpen(false);
      setVisible(false);
      return;
    }
    setImgBroken(false);
    setOpen(true);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [loading, tier]);

  const closeToProducts = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setOpen(false);
      setVisible(false);
      setLeaving(false);
      router.push("/products");
    }, 420);
  }, [router]);

  async function handleViewBenefits() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("clear_loyalty_celebration_pending");
      if (error) {
        console.error(error);
      }
      await refreshLoyalty();
    } finally {
      setBusy(false);
      closeToProducts();
    }
  }

  if (!open || !tier) return null;

  const c = COPY[tier];
  const t = SHOP_TEXT.vip.celebrationCta;
  const ctaLabel = t[audience];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 bg-stone-900/25 backdrop-blur-[2px] transition-opacity duration-500 ease-out"
        style={{ opacity: visible && !leaving ? 1 : 0 }}
        onClick={() => !busy && handleViewBenefits()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-headline"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-sm border border-amber-200/50 bg-[#faf8f4] shadow-[0_32px_64px_-24px_rgba(28,25,23,0.35),0_0_0_1px_rgba(255,255,255,0.6)_inset] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: visible && !leaving ? 1 : 0,
          transform:
            visible && !leaving ? "translateY(0) scale(1)" : "translateY(14px) scale(0.97)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,#78350f_0%,transparent_55%)]" />

        <div className="relative px-8 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
          <p className="text-center text-[10px] uppercase tracking-[0.45em] text-amber-900/35 font-medium mb-6">
            Sam Sian · Invitation
          </p>

          <div className="relative mx-auto w-full max-w-[240px] aspect-[3/4] mb-8 border border-amber-900/10 bg-gradient-to-b from-amber-50/90 to-stone-100/80 shadow-inner overflow-hidden">
            {!imgBroken ? (
              <Image
                src={`${INV_BASE}/invitation-${tier}.png`}
                alt=""
                fill
                className="object-cover"
                sizes="240px"
                priority
                onError={() => setImgBroken(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <span className="text-[9px] tracking-[0.5em] text-amber-900/25 uppercase">
                  {tier.toUpperCase()}
                </span>
                <span className="text-xs text-amber-900/35 font-serif italic leading-relaxed">
                  {audience === "ja"
                    ? "画像は準備中です。落ち着いた余白をお楽しみください。"
                    : "รูปเชิญกำลังเตรียม — พื้นที่ว่างอย่างมีรสนิยม"}
                </span>
              </div>
            )}
          </div>

          <h2
            id="celebration-headline"
            className="text-center font-serif text-[1.35rem] sm:text-2xl text-amber-950/90 tracking-tight font-normal leading-snug"
          >
            {c.headline}
          </h2>

          <p className="mt-5 text-center text-[13px] leading-[1.75] text-amber-950/55 font-light">
            {audience === "th" ? c.subTh : c.subJa}
          </p>

          <p className="mt-4 text-center text-[12px] leading-[1.85] text-amber-900/45 font-light">
            {audience === "th" ? c.perkTh : c.perkJa}
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleViewBenefits()}
            className="mt-10 w-full rounded-sm border border-amber-900/15 bg-amber-950/[0.03] py-3.5 text-[11px] font-medium uppercase tracking-[0.28em] text-amber-900/70 hover:bg-amber-950/[0.06] hover:text-amber-950 transition-colors disabled:opacity-50"
          >
            {busy ? "…" : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
