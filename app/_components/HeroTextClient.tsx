"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * 言語切り替えに連動するヒーローセクション。
 * app/page.tsx（Server Component）から呼び出す Client Component。
 * Supabase クエリやカートロジックには一切触れない。
 */
export default function HeroTextClient() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50">
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <span className="inline-block bg-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          {t.hero.eyebrow}
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-950 leading-tight tracking-tight mb-6">
          {t.hero.title1}
          <br className="hidden sm:block" />
          <span className="text-amber-600">{t.hero.title2}</span>
        </h1>

        <p className="text-amber-800/70 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
          {t.hero.sub}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#products"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {t.hero.cta}
            <ChevronRight size={20} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-amber-800 font-bold text-lg px-8 py-4 rounded-2xl border border-amber-200 transition-all active:scale-95"
          >
            {t.hero.ctaAbout}
          </Link>
        </div>
      </div>
    </section>
  );
}
