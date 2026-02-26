"use client";

import { Sparkles, Activity, Sprout } from "lucide-react";
import FadeInBlock from "./FadeInBlock";

const BENEFITS = [
  {
    id: "beauty",
    label: "美容",
    title: "1日10粒の『食べる美容液』",
    body: "亜鉛や鉄分、良質なオレイン酸が内側からの潤いをサポート。罪悪感のないギルトフリーなご褒美に。",
    Icon: Sparkles,
    imageFirst: true,
  },
  {
    id: "recovery",
    label: "リカバリー",
    title: "日々のパフォーマンスを底上げする天然のエナジーフード",
    body: "良質な植物性タンパク質とマグネシウムが、ハードな運動後や仕事の疲労回復をサポートします。",
    Icon: Activity,
    imageFirst: false,
  },
  {
    id: "snack",
    label: "おやつに",
    title: "お菓子を変えるだけで、ぐんぐん育つ",
    body: "スナック菓子の代わりに。カルシウムの吸収を助けるミネラルが豊富で、適度な歯ごたえが噛む力と集中力を育みます。",
    Icon: Sprout,
    imageFirst: true,
  },
] as const;

export default function HealthBenefitsSection() {
  return (
    <section
      className="bg-stone-50 py-20 sm:py-28 md:py-36"
      aria-labelledby="health-benefits-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <FadeInBlock>
          <h2
            id="health-benefits-heading"
            className="text-center text-stone-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3"
          >
            豆知識
          </h2>
          <p className="text-center text-stone-800 text-2xl sm:text-3xl md:text-4xl font-light tracking-tight max-w-2xl mx-auto mb-16 sm:mb-20 md:mb-24">
            カシューナッツの健康・美容効果
          </p>
        </FadeInBlock>

        <div className="space-y-24 sm:space-y-28 md:space-y-36">
          {BENEFITS.map(({ id, label, title, body, Icon, imageFirst }) => (
            <FadeInBlock key={id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
                {/* ビジュアル（アイコン） */}
                <div
                  className={`benefit-visual flex justify-center md:justify-end ${
                    imageFirst ? "md:order-1" : "md:order-2 md:justify-start"
                  }`}
                >
                  <div className="w-full max-w-sm aspect-square rounded-3xl flex items-center justify-center bg-stone-100/80 border border-stone-200/60">
                    <Icon
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-emerald-700/70"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                  </div>
                </div>

                {/* テキスト */}
                <div
                  className={`benefit-text space-y-5 md:space-y-6 text-left ${
                    imageFirst ? "md:order-2" : "md:order-1 md:text-right"
                  }`}
                >
                  <span className="inline-block text-emerald-700/90 text-xs font-medium uppercase tracking-widest">
                    {label}
                  </span>
                  <h3 className="text-stone-800 text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
                    {title}
                  </h3>
                  <p
                    className={`text-stone-600 text-base sm:text-lg leading-relaxed max-w-xl ${
                      imageFirst ? "" : "md:ml-auto"
                    }`}
                  >
                    {body}
                  </p>
                </div>
              </div>
            </FadeInBlock>
          ))}
        </div>
      </div>
    </section>
  );
}
