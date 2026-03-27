"use client";

import dynamic from "next/dynamic";

/**
 * Swiper は Cloudflare Workers 上の RSC/SSR バンドルで壊れることがあるため、
 * クライアント専用チャンクに閉じ込める（親の app/page は Server Component のまま）。
 */
const HeroCarousel = dynamic(() => import("./HeroCarousel"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full aspect-[4/5] sm:aspect-[21/9] max-h-[70vh] sm:max-h-[50vh] bg-amber-100/80 animate-pulse"
      aria-hidden
    />
  ),
});

export default function HeroCarouselDynamic() {
  return <HeroCarousel />;
}
