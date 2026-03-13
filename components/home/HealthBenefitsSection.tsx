"use client";

import { Sparkles, Activity, Sprout } from "lucide-react";
import FadeInBlock from "./FadeInBlock";
import { useAudience } from "@/context/AudienceContext";

const SECTION_TEXT = {
  ja: {
    label: "豆知識",
    title: "カシューナッツの健康・美容効果",
    benefits: [
      {
        id: "beauty",
        label: "美容",
        Icon: Sparkles,
        imageFirst: true,
        title: "1日10粒の『食べる美容液』",
        body: "亜鉛や鉄分、良質なオレイン酸が内側からの潤いをサポート。罪悪感のないギルトフリーなご褒美に。",
      },
      {
        id: "recovery",
        label: "リカバリー",
        Icon: Activity,
        imageFirst: false,
        title: "日々のパフォーマンスを底上げする天然のエナジーフード",
        body: "良質な植物性タンパク質とマグネシウムが、ハードな運動後や仕事の疲労回復をサポートします。",
      },
      {
        id: "snack",
        label: "おやつに",
        Icon: Sprout,
        imageFirst: true,
        title: "お菓子を変えるだけで、ぐんぐん育つ",
        body: "スナック菓子の代わりに。カルシウムの吸収を助けるミネラルが豊富で、適度な歯ごたえが噛む力と集中力を育みます。",
      },
    ],
  },
  th: {
    label: "ความรู้ดีๆ",
    title: "ประโยชน์ของมะม่วงหิมพานต์ต่อสุขภาพและความงาม",
    benefits: [
      {
        id: "beauty",
        label: "ความงาม",
        Icon: Sparkles,
        imageFirst: true,
        title: "กิน 10 เม็ดต่อวัน เพื่อผิวสุขภาพดีจากภายใน",
        body: "สังกะสี ธาตุเหล็ก และกรดโอเลอิกคุณภาพสูง ช่วยบำรุงผิวจากภายใน ของรางวัลที่ดีต่อสุขภาพโดยไม่ต้องรู้สึกผิด",
      },
      {
        id: "recovery",
        label: "ฟื้นฟูร่างกาย",
        Icon: Activity,
        imageFirst: false,
        title: "อาหารพลังงานธรรมชาติ เพิ่มประสิทธิภาพทุกวัน",
        body: "โปรตีนจากพืชและแมกนีเซียม ช่วยฟื้นฟูร่างกายหลังออกกำลังกายหนัก หรือเมื่อเหนื่อยล้าจากการทำงาน",
      },
      {
        id: "snack",
        label: "ของว่าง",
        Icon: Sprout,
        imageFirst: true,
        title: "เปลี่ยนขนม เสริมพัฒนาการ",
        body: "แทนขนมกรุบกรอบ อุดมด้วยแร่ธาตุที่ช่วยดูดซึมแคลเซียม และความกรุบกรอบพอดีช่วยฝึกการเคี้ยวและสมาธิ",
      },
    ],
  },
} as const;

export default function HealthBenefitsSection() {
  const audience = useAudience();
  const t = SECTION_TEXT[audience];

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
            {t.label}
          </h2>
          <p className="text-center text-stone-800 text-2xl sm:text-3xl md:text-4xl font-light tracking-tight max-w-2xl mx-auto mb-16 sm:mb-20 md:mb-24">
            {t.title}
          </p>
        </FadeInBlock>

        <div className="space-y-24 sm:space-y-28 md:space-y-36">
          {t.benefits.map(({ id, label, title, body, Icon, imageFirst }) => (
            <FadeInBlock key={id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
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
