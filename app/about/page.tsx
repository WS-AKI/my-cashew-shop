"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState, type ReactNode } from "react";
import {
  ChevronRight,
  Leaf,
  Sun,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Zap,
  Cookie,
  Truck,
  MessageCircleHeart,
  MapPin,
  Star,
  Flame,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

/* ─── Scroll-reveal wrapper ─────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(48px)",
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── BilingualHeading ───────────────────────────────────────────── */
function BilingualHeading({
  jp,
  en,
  as: Tag = "h2",
  className = "",
  isEn = false,
}: {
  jp: string;
  en: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  isEn?: boolean;
}) {
  return (
    <Tag className={className}>
      {isEn ? (
        <>
          <span className="block text-amber-950">{en}</span>
          <span className="block mt-1 text-sm sm:text-base font-medium text-stone-500">{jp}</span>
        </>
      ) : (
        <>
          <span className="block text-amber-950">{jp}</span>
          <span className="block mt-1 text-sm sm:text-base font-medium text-stone-500">{en}</span>
        </>
      )}
    </Tag>
  );
}

/* ─── Origin Story ───────────────────────────────────────────────── */
// ★ 仮画像（Unsplash フリー素材）
// ソンクランから戻ったら /public/about/ 内の各ファイルを本物の写真に差し替えてください:
//   story-farm.jpg   → ウタラディットの農場・カシュー果実の写真
//   story-roast.jpg  → 焙煎中・手作業の写真
//   story-quality.jpg→ 袋詰め・品質チェックの写真
const STORY_ITEMS = [
  {
    image: "/about/story-farm.jpg",
    alt: "Cashew farm in Uttaradit, Northern Thailand",
    icon: Leaf,
    jpTitle: "ウタラディット県の豊かな土壌",
    enTitle: "Rich Soil of Uttaradit Province",
    jpBody:
      "タイ北部・ウタラディット県は、水はけの良い土壌と温暖な気候に恵まれた栽培地。カシューナッツの甘みと香りを育てる、理想的な環境です。",
    enBody:
      "Uttaradit in Northern Thailand offers well-drained soil and a warm climate — ideal conditions for naturally sweet, aromatic cashews.",
  },
  {
    image: "/about/story-roast.jpg",
    alt: "Hand roasting cashew nuts in small batches",
    icon: Sun,
    jpTitle: "手作業での丁寧な焙煎",
    enTitle: "Carefully Hand-Roasted in Small Batches",
    jpBody:
      "収穫後すぐに小ロットで焙煎し、温度を細かく管理。焼きムラを抑え、軽やかな食感と芳醇な香ばしさを引き出します。",
    enBody:
      "We roast shortly after harvest in small batches with precise heat control, delivering clean texture and a rich, elegant aroma.",
  },
  {
    image: "/about/story-quality.jpg",
    alt: "Premium cashew quality inspection and packaging",
    icon: ShieldCheck,
    jpTitle: "鮮度を守る品質管理",
    enTitle: "Strict Quality Control for Freshness",
    jpBody:
      "焙煎後はすぐにチェックと包装を実施。自宅用はもちろん、大切な方へのギフトとしても選ばれる品質を一つひとつ丁寧に仕上げています。",
    enBody:
      "Each batch is inspected and sealed immediately after roasting — ensuring premium freshness for both daily enjoyment and gifting.",
  },
];

/* ─── Lifestyle Cards ────────────────────────────────────────────── */
const LIFESTYLE_CARDS = [
  {
    icon: Sparkles,
    // 美容写真: 白背景・大理石 → 上部はごく薄いローズ色でトーンを与える
    topScrim: "from-rose-900/20 via-transparent to-transparent",
    accentColor: "text-rose-200",
    jpTitle: "輝く毎日に",
    enTitle: "Beauty & Anti-aging",
    jpSub: "Beauty",
    jpBody: "オレイン酸・亜鉛が肌と髪のコンディションをサポート。内側から輝くための、賢い一粒。",
    enBody: "Oleic acid and zinc help support skin and hair from within — smart beauty nutrition in every bite.",
    image: "/about/lifestyle-beauty.png",
  },
  {
    icon: Zap,
    // リカバリー写真: ダーク木目・ダンベル → ウォームアンバーで統一感
    topScrim: "from-stone-900/30 via-transparent to-transparent",
    accentColor: "text-amber-200",
    jpTitle: "疲れた体のリカバリーに",
    enTitle: "Recovery & Energy",
    jpSub: "Recovery",
    jpBody: "鉄分・マグネシウムが疲労回復をサポート。運動後やハードな一日の終わりに最適なリカバリースナック。",
    enBody: "Iron and magnesium help restore energy after a long day or workout — the ideal recovery snack.",
    image: "/about/lifestyle-recovery.png",
  },
  {
    icon: Cookie,
    // スナック写真: 明るい木目・おもちゃ → フレッシュなグリーンで健康感を演出
    topScrim: "from-emerald-900/20 via-transparent to-transparent",
    accentColor: "text-emerald-200",
    jpTitle: "罪悪感のないご褒美おやつ",
    enTitle: "Healthy Daily Snack",
    jpSub: "Snack",
    jpBody: "自然のままの甘みと食感。人工添加物ゼロで、毎日のおやつタイムを豊かにする高品質なナッツです。",
    enBody: "No artificial additives — just the natural sweetness and crunch of premium cashews for a guilt-free treat.",
    image: "/about/lifestyle-snack.png",
  },
];

/* ─── Nutrition data ─────────────────────────────────────────────── */
// プログレスバーはブランドカラー（アンバー）に統一、アイコンのみ色で差別化
const NUTRITION_DATA = [
  {
    icon: HeartPulse,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    jpName: "オレイン酸",
    enName: "Oleic Acid",
    // 含有量の説明
    jpDesc: "カシューナッツの脂質の約82%を占める一価不飽和脂肪酸。",
    enDesc: "Heart-friendly monounsaturated fat — makes up ~82% of cashew's total fat.",
    // 摂取メリット
    jpBenefit: "悪玉コレステロール（LDL）を下げ、善玉（HDL）を高める。肌の保湿・弾力にも寄与し、内側から若々しさをサポート。",
    enBenefit: "Lowers LDL cholesterol and raises HDL. Also supports skin hydration and elasticity — beauty from within.",
    value: 82,
    unitDetail: "of total fat content",
  },
  {
    icon: Flame,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    jpName: "マグネシウム",
    enName: "Magnesium",
    jpDesc: "100gあたり292mg含有（1日推奨摂取量の約73%）。",
    enDesc: "292mg per 100g — about 73% of the recommended daily intake.",
    jpBenefit: "筋肉の収縮・弛緩を助け、神経の過剰興奮を抑制。ストレス軽減・睡眠の質の向上にも効果的。",
    enBenefit: "Helps regulate muscle function and calm nerve signals — supporting stress relief and better sleep quality.",
    value: 73,
    unitDetail: "Daily Value / 100g",
  },
  {
    icon: Star,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    jpName: "亜鉛",
    enName: "Zinc",
    jpDesc: "100gあたり5.8mg含有（1日推奨摂取量の約53%）。",
    enDesc: "5.8mg per 100g — about 53% of the recommended daily intake.",
    jpBenefit: "免疫細胞の生成を促進し、肌のターンオーバーをサポート。髪のコシ・爪の強化にも不可欠なミネラル。",
    enBenefit: "Boosts immune cell production and supports skin cell renewal. Essential for strong hair and nails.",
    value: 53,
    unitDetail: "Daily Value / 100g",
  },
  {
    icon: Sparkles,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    jpName: "鉄分",
    enName: "Iron",
    jpDesc: "100gあたり6.7mg含有（1日推奨摂取量の約37%）。",
    enDesc: "6.7mg per 100g — about 37% of the recommended daily intake.",
    jpBenefit: "赤血球を通じて全身に酸素を供給し、疲労感を軽減。集中力・持久力の維持にも大きく貢献。",
    enBenefit: "Delivers oxygen to cells via red blood cells, reducing fatigue and supporting focus and endurance.",
    value: 37,
    unitDetail: "Daily Value / 100g",
  },
];

/* ─── Page ───────────────────────────────────────────────────────── */
export default function AboutPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <Header />

      <main className="flex-1">

        {/* ━━━ 1. HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/vip/image_12.png"
              alt="Premium Cashews Hero"
              fill
              priority
              className="object-cover object-center"
            />
            {/* 視認性向上: より濃いオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/60" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-36">
            <Reveal>
              <p className="text-amber-300/90 text-xs uppercase tracking-[0.28em] font-semibold mb-4">
                About Samsian Cashew Nuts
              </p>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight max-w-4xl text-white drop-shadow-lg">
                {isEn ? (
                  <>
                    <span className="block">Premium Cashew Nuts</span>
                    <span className="block text-amber-400">from Uttaradit to Bangkok.</span>
                    <span className="block text-2xl sm:text-3xl font-semibold text-white/80 mt-2">
                      Directly Sourced from Nature.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">タイ北部からバンコクへ。</span>
                    <span className="block text-amber-400">自然の恵みが詰まった</span>
                    <span className="block">最高級カシューナッツ</span>
                  </>
                )}
              </h1>
              <p className="mt-6 text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                {isEn
                  ? "We carefully roast cashews at origin in Uttaradit and deliver them to Bangkok with premium freshness, aroma, and texture."
                  : "ウタラディット県の農園で育てたカシューナッツを産地で丁寧に焙煎し、バンコクへ。香り・食感・鮮度にこだわるプレミアムナッツをお届けします。"}
              </p>
              <Link
                href="/#products"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold px-7 py-3.5 shadow-xl transition-colors"
              >
                {isEn ? "Shop Now" : "商品を見る"}
                <ChevronRight size={18} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 2. ORIGIN STORY + MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-4 py-1.5 rounded-full mb-4">
              <MapPin size={12} />
              {isEn ? "Uttaradit, Northern Thailand" : "タイ北部・ウタラディット県"}
            </span>
            <BilingualHeading
              as="h2"
              jp="産地のストーリー"
              en="Origin Story from Uttaradit"
              isEn={isEn}
              className="text-2xl sm:text-3xl font-bold"
            />
            <p className="mt-4 text-amber-900/70 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              {isEn
                ? "From nutrient-rich soil to careful hand-roasting — three pillars behind every premium bag."
                : "豊かな土壌、丁寧な焙煎、確かな品質管理。3つのこだわりが、一袋に宿っています。"}
            </p>
          </Reveal>

          {/* Zigzag story */}
          <div className="space-y-16 mb-16">
            {STORY_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const reverse = idx % 2 === 1;
              return (
                <Reveal key={item.enTitle} delay={idx * 80}>
                  <article
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center ${
                      reverse ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-amber-100 shadow-md bg-amber-100">
                      <Image src={item.image} alt={item.alt} fill className="object-cover" />
                    </div>
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold">
                        <Icon size={13} />
                        Uttaradit, Thailand
                      </div>
                      <BilingualHeading
                        as="h3"
                        jp={item.jpTitle}
                        en={item.enTitle}
                        isEn={isEn}
                        className="text-xl sm:text-2xl font-semibold"
                      />
                      <p className="text-amber-900/80 leading-relaxed text-sm sm:text-base">
                        {isEn ? item.enBody : item.jpBody}
                      </p>
                      {!isEn && (
                        <p className="text-stone-500 text-sm leading-relaxed">{item.enBody}</p>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          {/* Google Map */}
          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-amber-200 shadow-md">
              <div className="bg-amber-50 px-5 py-3 flex items-center gap-2 border-b border-amber-100">
                <MapPin size={15} className="text-amber-600 shrink-0" />
                <p className="text-sm font-semibold text-amber-900">
                  {isEn ? "Uttaradit Province — Northern Thailand" : "ウタラディット県 — タイ北部"}
                </p>
                <span className="ml-auto text-xs text-stone-400 hidden sm:block">
                  {isEn ? "approx. 500 km north of Bangkok" : "バンコクから北へ約500km"}
                </span>
              </div>
              <iframe
                title="Uttaradit Province Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d482882.5!2d99.87519!3d17.620596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30dc69640d35d6b5%3A0x8bd4a73c69b5d07f!2sUttaradit%2C%20Thailand!5e0!3m2!1sen!2sth!4v1701234567890!5m2!1sen!2sth"
                width="100%"
                height="380"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </section>

        {/* ━━━ 3. LIFESTYLE CARDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-stone-50 border-y border-stone-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

            <Reveal className="text-center mb-12">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-4 py-1.5 rounded-full mb-4">
                {isEn ? "Why Cashews?" : "なぜカシューナッツ？"}
              </span>
              <BilingualHeading
                as="h2"
                jp="3つのライフスタイル提案"
                en="Three Ways to Enjoy Every Day"
                isEn={isEn}
                className="text-2xl sm:text-3xl font-bold"
              />
              <p className="mt-4 text-amber-900/70 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                {isEn
                  ? "Premium cashews aren't just a snack — they're a lifestyle choice."
                  : "最高品質のカシューナッツは、ただのおやつではありません。毎日の豊かさへの投資です。"}
              </p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {LIFESTYLE_CARDS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Reveal key={card.enTitle} delay={idx * 120}>
                    <article className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-400 cursor-default">
                      {/* Image */}
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={card.image}
                          alt={card.enTitle}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        {/* 上部: 薄いカラートーン（写真の色を殺さない程度） */}
                        <div className={`absolute inset-0 bg-gradient-to-b ${card.topScrim}`} />
                        {/* 下部: テキスト視認用の強いスクリム */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        {/* Icon */}
                        <div className="inline-flex w-10 h-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 mb-3">
                          <Icon size={18} className="text-white" />
                        </div>
                        {/* Eyebrow */}
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 ${card.accentColor}`}>
                          {isEn ? card.enTitle : card.jpSub}
                        </p>
                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
                          {isEn ? card.enTitle : card.jpTitle}
                        </h3>
                        {/* Body */}
                        <p className="text-white/80 text-sm leading-relaxed">
                          {isEn ? card.enBody : card.jpBody}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ 4. NUTRITION VISUALIZATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left */}
            <Reveal>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full mb-4">
                  {isEn ? "Nutrition Science" : "栄養素ガイド"}
                </span>
                <BilingualHeading
                  as="h2"
                  jp="豆知識・栄養素ガイド"
                  en="Nutrition & Wellness Guide"
                  isEn={isEn}
                  className="text-2xl sm:text-3xl font-bold"
                />
                <p className="mt-4 text-amber-900/70 leading-relaxed text-sm sm:text-base">
                  {isEn
                    ? "Cashews are among the most nutrient-dense nuts available — here's a visual breakdown per 100g."
                    : "カシューナッツは栄養密度の高いナッツの代表格。主要な栄養素を100gあたりの数値で可視化しました。"}
                </p>

                {/* Stats grid */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { val: "18g", jp: "タンパク質 / 100g", en: "Protein / 100g", bg: "bg-amber-50", border: "border-amber-100", color: "text-amber-600" },
                    { val: "553", jp: "kcal / 100g", en: "kcal / 100g", bg: "bg-teal-50", border: "border-teal-100", color: "text-teal-600" },
                    { val: "0", jp: "人工添加物", en: "Artificial Additives", bg: "bg-rose-50", border: "border-rose-100", color: "text-rose-500" },
                    { val: "30g", jp: "炭水化物 / 100g", en: "Carbs / 100g", bg: "bg-orange-50", border: "border-orange-100", color: "text-orange-500" },
                  ].map((s, i) => (
                    <Reveal key={s.en} delay={i * 60}>
                      <div className={`rounded-2xl ${s.bg} border ${s.border} p-4 text-center`}>
                        <p className={`text-3xl font-extrabold ${s.color}`}>{s.val}</p>
                        <p className="text-xs font-semibold text-stone-600 mt-1">{isEn ? s.en : s.jp}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right: Progress bars */}
            <div className="space-y-4">
              {NUTRITION_DATA.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.enName} delay={idx * 80}>
                    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5 space-y-3">

                      {/* Header row: icon + name + % */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg} shrink-0`}>
                            <Icon size={17} className={item.iconColor} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-amber-950">
                              {isEn ? item.enName : item.jpName}
                            </p>
                            <p className="text-xs text-stone-400">
                              {isEn ? item.jpName : item.enName}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-extrabold text-amber-600">
                          {item.value}
                          <span className="text-sm font-normal text-stone-400 ml-0.5">%</span>
                        </span>
                      </div>

                      {/* Progress bar — ブランドカラーに統一 */}
                      <div className="h-2.5 rounded-full bg-amber-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>

                      {/* 含有量メモ */}
                      <p className="text-[10px] text-stone-400 font-medium">{item.unitDetail}</p>

                      {/* 区切り線 */}
                      <hr className="border-stone-100" />

                      {/* メリット */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                          {isEn ? "Health Benefit" : "摂取メリット"}
                        </p>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {isEn ? item.enBenefit : item.jpBenefit}
                        </p>
                        {/* 常にもう一方の言語も小さく表示 */}
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          {isEn ? item.jpBenefit : item.enBenefit}
                        </p>
                      </div>

                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ 5. BRAND MESSAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Reveal>
          <section className="bg-amber-950 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
              <div className="max-w-3xl">
                <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-bold mb-6">
                  {isEn ? "Our Promise" : "私たちの約束"}
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white">
                  {isEn
                    ? "Nature's finest from Uttaradit, delivered fresh to your door in Bangkok."
                    : "ウタラディットの豊かな恵みを、バンコクのあなたの日常へ。"}
                </h2>
                <p className="mt-2 text-amber-300/80 text-base sm:text-lg font-medium">
                  {isEn
                    ? "ウタラディットの豊かな恵みを、バンコクのあなたの日常へ。"
                    : "Nature's finest from Uttaradit, delivered fresh to your door in Bangkok."}
                </p>
                <p className="mt-6 text-amber-100/65 text-sm sm:text-base leading-relaxed">
                  {isEn
                    ? "We believe the finest flavors are born from honest soil and patient hands. Every bag from Samsian carries the character of Uttaradit — a quiet pride in quality that needs no embellishment."
                    : "最高の味わいは、誠実な土壌と丁寧な手仕事から生まれます。Samsianの一袋一袋には、ウタラディットの静かな誇りと品質へのこだわりが宿っています。"}
                </p>
              </div>

              {/* Feature chips */}
              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { icon: HeartPulse, jp: "日本への一時帰国にも最適なギフト", en: "Premium gift for souvenirs to Japan" },
                  { icon: Truck, jp: "バンコク市内への迅速配送", en: "Fast delivery across Bangkok" },
                  { icon: MessageCircleHeart, jp: "日本語・英語でのLINEサポート", en: "Bilingual LINE support (JP / EN)" },
                ].map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <div
                      key={chip.en}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-700/50 bg-amber-900/40 px-4 py-2 text-sm text-amber-200"
                    >
                      <Icon size={14} className="text-amber-400 shrink-0" />
                      {isEn ? chip.en : chip.jp}
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/#products"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold px-7 py-3.5 shadow-lg transition-colors"
                >
                  {isEn ? "Browse Products" : "商品一覧へ"}
                  <ChevronRight size={18} />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-700/60 bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 font-bold px-7 py-3.5 transition-colors"
                >
                  {isEn ? "Track Your Order" : "注文状況を確認"}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

      </main>
      <Footer />
    </div>
  );
}
