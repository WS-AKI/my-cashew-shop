"use client";

import { useEffect, useState } from "react";
import type { VipTier } from "@/lib/loyalty/sync-loyalty-profile";

const LABEL: Record<VipTier, string> = {
  normal: "Normal",
  silver: "Silver",
  gold: "Gold",
};

type Props = {
  tier: VipTier;
  className?: string;
};

const ICON_SRC: Record<VipTier, string> = {
  gold: "/vip/rank-gold.png",
  silver: "/vip/rank-silver.png",
  normal: "/vip/rank-normal.png",
};

const TONE: Record<VipTier, { ring: string; text: string; iconBg: string; fallback: string }> = {
  gold: {
    ring: "ring-1 ring-amber-300/70 shadow-[0_0_6px_1px_rgba(217,166,63,0.35)]",
    text: "text-amber-900/90",
    iconBg: "bg-[#1a1208]",
    fallback: "G",
  },
  silver: {
    ring: "ring-1 ring-slate-300/60 shadow-[0_0_5px_1px_rgba(180,180,190,0.30)]",
    text: "text-slate-600/90",
    iconBg: "bg-[#0e0f12]",
    fallback: "S",
  },
  normal: {
    ring: "ring-1 ring-amber-200/50",
    text: "text-amber-800/70",
    iconBg: "bg-[#c8a96a]",
    fallback: "N",
  },
};

export default function LoyaltyRankBadge({ tier, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const tone = TONE[tier];
  const iconSrc = ICON_SRC[tier];

  // tier が変わったら失敗状態をリセット
  useEffect(() => {
    setFailed(false);
  }, [iconSrc]);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/75 px-2.5 py-[3px] backdrop-blur-sm shadow-[0_1px_8px_-6px_rgba(0,0,0,0.4)] ${className}`}
      aria-label={`Member status ${LABEL[tier]}`}
    >
      {/* 紋章アイコン: object-contain で全体を見せる */}
      <span
        className={`relative inline-flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${tone.ring} ${tone.iconBg}`}
      >
        {!failed ? (
          <img
            key={iconSrc}
            src={iconSrc}
            alt=""
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className={`text-[10px] font-semibold ${tone.text}`}>{tone.fallback}</span>
        )}
      </span>
      <span
        className={`text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] ${tone.text}`}
      >
        {LABEL[tier]}
      </span>
    </div>
  );
}
