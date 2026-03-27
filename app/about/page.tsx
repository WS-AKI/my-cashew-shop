"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Leaf,
  Sun,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Gift,
  Plane,
  Truck,
  MessageCircleHeart,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type StoryItem = {
  image: string;
  alt: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  jpTitle: string;
  enTitle: string;
  jpBody: string;
  enBody: string;
};

const STORY_ITEMS: StoryItem[] = [
  {
    image: "/vip/image_12.png",
    alt: "Uttaradit farmland",
    icon: Leaf,
    jpTitle: "ウタラディット県の豊かな土壌",
    enTitle: "Rich Soil in Uttaradit Province",
    jpBody:
      "タイ北部・ウタラディット県は、水はけの良い土壌と温暖な気候に恵まれた栽培地。カシューナッツの甘みと香りを育てる、理想的な環境です。",
    enBody:
      "Uttaradit in Northern Thailand offers well-drained soil and a warm climate, creating ideal conditions for naturally sweet, aromatic premium cashews.",
  },
  {
    image: "/vip/image_13.png",
    alt: "Hand roasting process",
    icon: Sun,
    jpTitle: "手作業での丁寧な焙煎",
    enTitle: "Carefully Hand-Roasted in Small Batches",
    jpBody:
      "収穫後すぐに小ロットで焙煎し、温度を細かく管理。焼きムラを抑え、軽やかな食感と芳醇な香ばしさを引き出します。",
    enBody:
      "We roast shortly after harvest in small batches with precise heat control, delivering clean texture and a rich, elegant aroma.",
  },
  {
    image: "/vip/invitation-gold.png",
    alt: "Premium quality packaging",
    icon: ShieldCheck,
    jpTitle: "鮮度を守る品質管理",
    enTitle: "Strict Quality Control for Freshness",
    jpBody:
      "焙煎後はすぐにチェックと包装を実施。自宅用はもちろん、ギフトとしても選ばれる品質を一つひとつ丁寧に仕上げています。",
    enBody:
      "After roasting, every batch is inspected and packed quickly to preserve freshness, making each bag suitable for both daily enjoyment and premium gifting.",
  },
];

const NUTRITION_ITEMS = [
  {
    icon: HeartPulse,
    jp: "オレイン酸 (Oleic Acid)",
    en: "Healthy monounsaturated fat that supports balanced daily nutrition.",
  },
  {
    icon: Sparkles,
    jp: "鉄分 (Iron)",
    en: "A key mineral for maintaining everyday energy and physical condition.",
  },
  {
    icon: ShieldCheck,
    jp: "亜鉛 (Zinc)",
    en: "Supports both body maintenance and beauty-focused nutrition.",
  },
  {
    icon: Gift,
    jp: "ビタミン・ミネラル (Vitamins & Minerals)",
    en: "Includes magnesium and vitamin K for smarter snacking habits.",
  },
] as const;

function BilingualHeading({
  jp,
  en,
  as = "h2",
  className = "",
}: {
  jp: string;
  en: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag className={className}>
      <span className="block text-amber-950">{jp}</span>
      <span className="block mt-1 text-sm sm:text-base font-medium text-stone-500">{en}</span>
    </Tag>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/vip/image_12.png"
              alt="Premium Cashews Hero"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/45 to-amber-900/45" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <p className="text-amber-100/90 text-xs uppercase tracking-[0.28em] font-semibold">
              About Samsian Cashew Nuts
            </p>
            <BilingualHeading
              as="h1"
              jp="タイ北部からバンコクへ。自然の恵みが詰まった最高級カシューナッツ"
              en="Premium Cashew Nuts from Uttaradit to Bangkok. Directly sourced from nature."
              className="mt-4 text-3xl sm:text-5xl font-extrabold leading-tight max-w-5xl text-white"
            />
            <p className="mt-6 text-amber-50/95 text-sm sm:text-base leading-relaxed max-w-3xl">
              ウタラディット県の農園で育てたカシューナッツを産地で丁寧に焙煎し、バンコクへ。香り・食感・鮮度にこだわるプレミアムナッツをお届けします。
              <span className="block mt-2 text-amber-100/85">
                We carefully roast cashews at origin in Uttaradit and deliver them to Bangkok with premium freshness, aroma, and texture.
              </span>
            </p>
            <Link
              href="/#products"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 shadow-lg transition-colors"
            >
              商品を見る / Shop Now
              <ChevronRight size={18} />
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <BilingualHeading
            as="h2"
            jp="産地のストーリー"
            en="Origin Story from Uttaradit"
            className="text-2xl sm:text-3xl font-bold text-center"
          />
          <p className="mt-4 text-center text-amber-900/70 max-w-3xl mx-auto leading-relaxed">
            土壌、焙煎、品質管理。3つのこだわりを、画像とともにご紹介します。
            <span className="block mt-1 text-stone-500">
              Soil, roasting, and quality control - presented in a premium zigzag layout.
            </span>
          </p>

          <div className="mt-12 space-y-16">
            {STORY_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const reverse = idx % 2 === 1;
              return (
                <article
                  key={item.enTitle}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center ${
                    reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-amber-100 shadow-sm bg-amber-100">
                    <Image src={item.image} alt={item.alt} fill className="object-cover" />
                  </div>
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold">
                      <Icon size={14} />
                      Uttaradit
                    </div>
                    <BilingualHeading
                      as="h3"
                      jp={item.jpTitle}
                      en={item.enTitle}
                      className="text-2xl font-semibold"
                    />
                    <p className="text-amber-900/75 leading-relaxed">
                      {item.jpBody}
                      <span className="block mt-2 text-stone-500">{item.enBody}</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-white/90 border-y border-amber-100/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <BilingualHeading
              as="h2"
              jp="豆知識・栄養素ガイド"
              en="Nutrition & Wellness Guide"
              className="text-2xl sm:text-3xl font-bold"
            />
            <p className="mt-3 text-amber-900/70 max-w-3xl leading-relaxed">
              健康・美容に役立つ栄養素を、日英で分かりやすく整理しました。
              <span className="block mt-1 text-stone-500">
                Structured for readability with semantic headings (h2/h3) and concise expert-friendly cards.
              </span>
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {NUTRITION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.jp}
                    className="rounded-2xl border border-amber-100 bg-[#fffdf8] p-6 shadow-[0_10px_30px_-24px_rgba(120,53,15,0.45)]"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Icon size={18} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-amber-950">{item.jp}</h3>
                    <p className="mt-2 text-sm text-stone-500 leading-relaxed">{item.en}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-10">
            <BilingualHeading
              as="h2"
              jp="バンコク在住者へのメッセージ"
              en="For International Residents in Bangkok"
              className="text-2xl sm:text-3xl font-bold"
            />
            <p className="mt-4 text-amber-900/75 leading-relaxed max-w-4xl">
              日英バイリンガルで丁寧にサポートし、LINEでも迅速に対応。日本への一時帰国前の手土産選びにも最適です。
              <span className="block mt-2 text-stone-500">
                Bilingual support (Japanese/English), responsive LINE assistance, and premium quality ideal for gifting before returning to Japan.
              </span>
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 flex items-start gap-2 text-sm text-amber-900">
                <Gift size={16} className="text-amber-700 mt-0.5" />
                <span>
                  日本への一時帰国のお土産に最適
                  <span className="block text-stone-500 text-xs mt-0.5">Perfect for souvenirs to Japan</span>
                </span>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 flex items-start gap-2 text-sm text-amber-900">
                <Truck size={16} className="text-amber-700 mt-0.5" />
                <span>
                  バンコク内への迅速な配送
                  <span className="block text-stone-500 text-xs mt-0.5">Fast delivery in Bangkok</span>
                </span>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 flex items-start gap-2 text-sm text-amber-900">
                <MessageCircleHeart size={16} className="text-amber-700 mt-0.5" />
                <span>
                  LINEで手厚くサポート
                  <span className="block text-stone-500 text-xs mt-0.5">Dedicated support via LINE</span>
                </span>
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white border border-amber-200 px-4 py-3 text-sm text-amber-900">
              <Plane size={16} className="text-amber-700" />
              Bangkok lifestyle-friendly premium snack, gift-ready quality.
            </div>

            <div>
              <Link
                href="/#products"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 shadow-md transition-colors"
              >
                商品一覧へ / Browse Products
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
