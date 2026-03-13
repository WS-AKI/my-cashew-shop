"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Leaf, Sun, Heart, MapPin } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Cell, LabelList, Tooltip,
} from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FadeInBlock from "@/components/home/FadeInBlock";
import { useAudience } from "@/context/AudienceContext";

// ─── 型 ─────────────────────────────────────────────────────────
type Tab = "about" | "location" | "nutrition";
type Value = { Icon: LucideIcon; bg: string; iconColor: string; title: string; desc: string };
type Benefit = { id: string; label: string; imageSrc: string; imageFirst: boolean; title: string; body: string };
type Nutrient = { name: string; pct: number; color: string; unit: string };
type Macro = { label: string; value: string; unit: string; bg: string; text: string };

// ─── 二言語コンテンツ ────────────────────────────────────────────
const CONTENT = {
  ja: {
    tabs: [
      { id: "about" as Tab,     label: "私たちについて"     },
      { id: "location" as Tab,  label: "産地・ウタラディット" },
      { id: "nutrition" as Tab, label: "豆知識・栄養"       },
    ],
    values: [
      { Icon: Leaf,   bg: "bg-green-100", iconColor: "text-green-600", title: "自然の恵み",      desc: "化学肥料に頼らず、ウタラディットの豊かな土壌と太陽の光で育ったカシューナッツです。" },
      { Icon: Sun,    bg: "bg-amber-100", iconColor: "text-amber-600", title: "丁寧な焙煎",      desc: "素材本来の旨みを最大限に引き出すため、一つひとつ丁寧に焙煎しています。" },
      { Icon: Heart,  bg: "bg-rose-100",  iconColor: "text-rose-500",  title: "産地直送",        desc: "農園から直接お届けするので、いつでも新鮮。中間業者を通さない分、お求めやすい価格でご提供します。" },
      { Icon: MapPin, bg: "bg-blue-100",  iconColor: "text-blue-600",  title: "ウタラディット県", desc: "タイ北部に位置するウタラディット県は、高品質なカシューナッツの産地として知られています。" },
    ] as Value[],
    aboutIntro: "タイ北部ウタラディット県。豊かな自然と温暖な気候に恵まれたこの地で、私たちはカシューナッツを大切に育てています。",
    aboutCta: "商品を見る",
    locationTitle: "どこにあるの？",
    locationDesc: "ウタラディット県はタイ北部にあります。バンコクから北へ約460km、車で約5〜6時間の距離です。タイ語では",
    locationDescSuffix: "（チャンウワット・ウタラディット）と表記されます。",
    mapOpen: "Google マップで開く",
    climateTitle: "気候と風土",
    climateDesc: "温暖な気候で、雨季と乾季がはっきりしています。日照が十分で、土壌も水はけが良いため、カシューナッツの栽培に適した環境です。ウタラディットの大地でゆっくり育った実だけを、収穫後に丁寧に焙煎してお届けしています。",
    whyTitle: "なぜウタラディットのカシューなのか",
    whyDesc: "タイではウタラディット県がカシューナッツの産地として知られています。収穫した生ナッツを農園近くで焙煎し、鮮度を保ったままお届けするため、香りと食感を損ないません。中間業者を挟まない産地直送だからこそ、安心とおいしさを両立できています。",
    locationCta: "商品を見る",
    nutritionLabel: "Trivia",
    nutritionTitle: "カシューナッツが体に嬉しい理由",
    nutritionSub: "小さな一粒に、美容・健康・活力を支える栄養素が凝縮されています。",
    nutritionCta: "商品を見る",
    chartTitle: "1回分（28g・約18粒）の栄養素",
    chartSub: "1日推奨量に対する割合（%DV）",
    chartSource: "出典: USDA FoodData Central（28g / 約18粒あたり）",
    chartTooltip: "1日推奨量",
    macros: [
      { label: "カロリー",   value: "157", unit: "kcal", bg: "bg-amber-50",   text: "text-amber-700"  },
      { label: "脂質",      value: "12",  unit: "g",    bg: "bg-stone-50",   text: "text-stone-700"  },
      { label: "タンパク質", value: "5",   unit: "g",    bg: "bg-emerald-50", text: "text-emerald-700" },
      { label: "炭水化物",  value: "9",   unit: "g",    bg: "bg-sky-50",     text: "text-sky-700"    },
    ] as Macro[],
    nutrients: [
      { name: "銅",          pct: 69, color: "#b45309", unit: "0.62 mg" },
      { name: "マンガン",    pct: 20, color: "#0891b2", unit: "0.47 mg" },
      { name: "マグネシウム", pct: 17, color: "#059669", unit: "74 mg"  },
      { name: "亜鉛",        pct: 15, color: "#7c3aed", unit: "1.6 mg" },
      { name: "リン",        pct: 13, color: "#d97706", unit: "166 mg" },
      { name: "鉄分",        pct: 11, color: "#dc2626", unit: "1.9 mg" },
      { name: "タンパク質",  pct: 10, color: "#65a30d", unit: "5 g"    },
      { name: "ビタミンK",   pct: 8,  color: "#9333ea", unit: "9.7 μg" },
    ] as Nutrient[],
    benefits: [
      {
        id: "beauty", label: "美容", imageSrc: "/beauty.jpg", imageFirst: true,
        title: "1日10粒の『食べる美容液』",
        body: "亜鉛や鉄分、良質なオレイン酸が内側からの潤いをサポート。罪悪感のないギルトフリーなご褒美に。",
      },
      {
        id: "recovery", label: "リカバリー", imageSrc: "/recovery.jpg", imageFirst: false,
        title: "日々のパフォーマンスを底上げする天然のエナジーフード",
        body: "良質な植物性タンパク質とマグネシウムが、ハードな運動後や仕事の疲労回復をサポートします。",
      },
      {
        id: "snack", label: "おやつに", imageSrc: "/family.jpg", imageFirst: true,
        title: "お菓子を変えるだけで、ぐんぐん育つ",
        body: "スナック菓子の代わりに。カルシウムの吸収を助けるミネラルが豊富で、適度な歯ごたえが噛む力と集中力を育みます。",
      },
    ] as Benefit[],
  },
  th: {
    tabs: [
      { id: "about" as Tab,     label: "เกี่ยวกับเรา"          },
      { id: "location" as Tab,  label: "ที่ตั้ง - อุตรดิตถ์"    },
      { id: "nutrition" as Tab, label: "โภชนาการ - ความรู้"     },
    ],
    values: [
      { Icon: Leaf,   bg: "bg-green-100", iconColor: "text-green-600", title: "ธรรมชาติบริสุทธิ์",       desc: "ไม่ใช้ปุ๋ยเคมี ปลูกด้วยดินอุดมสมบูรณ์และแสงแดดธรรมชาติของอุตรดิตถ์" },
      { Icon: Sun,    bg: "bg-amber-100", iconColor: "text-amber-600", title: "คั่วอย่างพิถีพิถัน",       desc: "คั่วทีละน้อยเพื่อดึงรสชาติแท้ของมะม่วงหิมพานต์ออกมาอย่างเต็มที่" },
      { Icon: Heart,  bg: "bg-rose-100",  iconColor: "text-rose-500",  title: "ส่งตรงจากสวน",             desc: "ส่งตรงจากฟาร์มถึงมือคุณ ไม่ผ่านคนกลาง ราคาคุ้มค่า สินค้าสดใหม่" },
      { Icon: MapPin, bg: "bg-blue-100",  iconColor: "text-blue-600",  title: "จังหวัดอุตรดิตถ์",          desc: "จังหวัดในภาคเหนือของไทย ขึ้นชื่อเรื่องมะม่วงหิมพานต์คุณภาพสูง" },
    ] as Value[],
    aboutIntro: "จากจังหวัดอุตรดิตถ์ ภาคเหนือของไทย ที่ซึ่งธรรมชาติอุดมสมบูรณ์และอากาศอบอุ่น เราปลูกมะม่วงหิมพานต์ด้วยความรักและใส่ใจ",
    aboutCta: "ดูสินค้า",
    locationTitle: "อยู่ที่ไหน?",
    locationDesc: "จังหวัดอุตรดิตถ์ตั้งอยู่ทางภาคเหนือของไทย ห่างจากกรุงเทพฯ ประมาณ 460 กม. ใช้เวลาขับรถประมาณ 5–6 ชั่วโมง",
    locationDescSuffix: "",
    mapOpen: "เปิดใน Google Maps",
    climateTitle: "ภูมิอากาศและสภาพแวดล้อม",
    climateDesc: "อากาศอบอุ่น มีฤดูฝนและฤดูแล้งที่ชัดเจน แสงแดดเพียงพอและดินระบายน้ำได้ดี เหมาะสำหรับการปลูกมะม่วงหิมพานต์ เราคัดผลที่สุกงอมจากแปลงปลูกของอุตรดิตถ์ แล้วนำมาคั่วสดก่อนส่งถึงมือคุณ",
    whyTitle: "ทำไมต้องมะม่วงหิมพานต์อุตรดิตถ์?",
    whyDesc: "จังหวัดอุตรดิตถ์ขึ้นชื่อว่าเป็นแหล่งผลิตมะม่วงหิมพานต์ชั้นนำของไทย เราคั่วมะม่วงหิมพานต์ใกล้กับสวน รักษาความสดและกลิ่นหอมไว้ได้อย่างเต็มที่ ส่งตรงโดยไม่ผ่านพ่อค้าคนกลาง มั่นใจในคุณภาพและรสชาติ",
    locationCta: "ดูสินค้า",
    nutritionLabel: "ความรู้",
    nutritionTitle: "ทำไมมะม่วงหิมพานต์ถึงดีต่อสุขภาพ",
    nutritionSub: "เม็ดเล็กๆ หนึ่งเม็ด อัดแน่นด้วยสารอาหารที่ดีต่อทั้งความงามและสุขภาพ",
    nutritionCta: "ดูสินค้า",
    chartTitle: "สารอาหารต่อ 1 หน่วยบริโภค (28 ก. / ประมาณ 18 เม็ด)",
    chartSub: "% ของปริมาณที่แนะนำต่อวัน (%DV)",
    chartSource: "ที่มา: USDA FoodData Central (28 ก. / ประมาณ 18 เม็ด)",
    chartTooltip: "ปริมาณแนะนำต่อวัน",
    macros: [
      { label: "แคลอรี่",     value: "157", unit: "kcal", bg: "bg-amber-50",   text: "text-amber-700"  },
      { label: "ไขมัน",       value: "12",  unit: "g",    bg: "bg-stone-50",   text: "text-stone-700"  },
      { label: "โปรตีน",      value: "5",   unit: "g",    bg: "bg-emerald-50", text: "text-emerald-700" },
      { label: "คาร์โบไฮเดรต", value: "9",   unit: "g",    bg: "bg-sky-50",     text: "text-sky-700"    },
    ] as Macro[],
    nutrients: [
      { name: "ทองแดง",       pct: 69, color: "#b45309", unit: "0.62 mg" },
      { name: "แมงกานีส",     pct: 20, color: "#0891b2", unit: "0.47 mg" },
      { name: "แมกนีเซียม",   pct: 17, color: "#059669", unit: "74 mg"  },
      { name: "สังกะสี",      pct: 15, color: "#7c3aed", unit: "1.6 mg" },
      { name: "ฟอสฟอรัส",     pct: 13, color: "#d97706", unit: "166 mg" },
      { name: "ธาตุเหล็ก",    pct: 11, color: "#dc2626", unit: "1.9 mg" },
      { name: "โปรตีน",       pct: 10, color: "#65a30d", unit: "5 g"    },
      { name: "วิตามิน K",    pct: 8,  color: "#9333ea", unit: "9.7 μg" },
    ] as Nutrient[],
    benefits: [
      {
        id: "beauty", label: "ความงาม", imageSrc: "/beauty.jpg", imageFirst: true,
        title: "กิน 10 เม็ดต่อวัน เพื่อผิวสุขภาพดีจากภายใน",
        body: "สังกะสี ธาตุเหล็ก และกรดโอเลอิกคุณภาพสูง ช่วยบำรุงผิวจากภายใน ของรางวัลเพื่อสุขภาพที่ไม่ต้องรู้สึกผิด",
      },
      {
        id: "recovery", label: "ฟื้นฟูร่างกาย", imageSrc: "/recovery.jpg", imageFirst: false,
        title: "อาหารพลังงานธรรมชาติ เพิ่มประสิทธิภาพทุกวัน",
        body: "โปรตีนจากพืชและแมกนีเซียม ช่วยฟื้นฟูร่างกายหลังออกกำลังกายหนัก หรือเมื่อเหนื่อยล้าจากการทำงาน",
      },
      {
        id: "snack", label: "ของว่าง", imageSrc: "/family.jpg", imageFirst: true,
        title: "เปลี่ยนขนม เสริมพัฒนาการ",
        body: "แทนขนมกรุบกรอบ อุดมด้วยแร่ธาตุที่ช่วยดูดซึมแคลเซียม และความกรุบกรอบพอดีช่วยฝึกการเคี้ยวและสมาธิ",
      },
    ] as Benefit[],
  },
} as const;

const MAP_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=99.7%2C17.2%2C100.6%2C18.2&layer=mapnik&marker=17.62%2C100.1";
const MAP_LINK_URL = "https://www.google.com/maps/search/Uttaradit+Province+Thailand";

// ─── 栄養グラフ ───────────────────────────────────────────────────
function NutritionChart({ macros, nutrients, chartTitle, chartSub, chartSource, chartTooltip }: {
  macros: Macro[];
  nutrients: Nutrient[];
  chartTitle: string;
  chartSub: string;
  chartSource: string;
  chartTooltip: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
      <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Nutrition Facts</p>
      <h3 className="text-xl sm:text-2xl font-semibold text-stone-800 mt-1">{chartTitle}</h3>
      <p className="text-sm text-stone-400 mt-1">{chartSub}</p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 mb-8">
        {macros.map(({ label, value, unit, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 sm:p-4 text-center`}>
            <p className={`text-2xl sm:text-3xl font-bold ${text}`}>{value}</p>
            <p className="text-xs text-stone-400 font-medium">{unit}</p>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate">{label}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          layout="vertical"
          data={nutrients}
          margin={{ top: 4, right: 52, left: 8, bottom: 4 }}
          barSize={13}
          barCategoryGap="28%"
        >
          <XAxis type="number" domain={[0, 80]} hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 13, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            width={92}
          />
          <Tooltip
            cursor={{ fill: "#fafaf9" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value ?? ""}%`, chartTooltip]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 13 }}
          />
          <Bar
            dataKey="pct"
            radius={[0, 6, 6, 0]}
            background={{ fill: "#f5f5f4", radius: [0, 6, 6, 0] } as object}
          >
            {nutrients.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.82} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${v ?? ""}%`}
              style={{ fontSize: 12, fontWeight: 700, fill: "#57534e" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-stone-400 mt-3">{chartSource}</p>
    </div>
  );
}

// ─── ページ本体 ───────────────────────────────────────────────────
export default function AboutPage() {
  const audience = useAudience();
  const c = CONTENT[audience];
  const [activeTab, setActiveTab] = useState<Tab>("about");

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 py-14 sm:py-20 px-4 text-center">
        <span className="text-5xl mb-4 block">🌿</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 mb-3">
          Sam Sian Cashew Nuts
        </h1>
        <p className="text-amber-700/70 text-sm">เกี่ยวกับเรา · About Us</p>
      </section>

      {/* スティッキータブナビ */}
      <div className="sticky top-16 z-30 bg-amber-50/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <nav className="max-w-4xl mx-auto flex" aria-label="tab navigation">
          {c.tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-selected={activeTab === id}
              className={`flex-1 py-3.5 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeTab === id
                  ? "border-amber-500 text-amber-900"
                  : "border-transparent text-amber-600/60 hover:text-amber-700 hover:border-amber-200"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <main className="flex-1 bg-amber-50">
        {activeTab === "about" && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-12">
            <FadeInBlock>
              <div className="text-center space-y-5">
                <h2 className="text-2xl font-extrabold text-amber-950">Sam Sian Cashew Nuts</h2>
                <p className="text-amber-800/70 leading-relaxed">{c.aboutIntro}</p>
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {c.values.map(({ Icon, bg, iconColor, title, desc }) => (
                  <div
                    key={title}
                    className="bg-white rounded-2xl border border-amber-100 p-6 space-y-3 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon size={22} className={iconColor} />
                    </div>
                    <h3 className="font-bold text-stone-800">{title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <div className="text-center pt-2">
                <Link
                  href="/#products"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95"
                >
                  {c.aboutCta}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </FadeInBlock>
          </div>
        )}

        {activeTab === "location" && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-16">
            <FadeInBlock>
              <div className="space-y-4">
                <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">Location</p>
                <h2 className="text-2xl font-semibold text-stone-800">{c.locationTitle}</h2>
                <p className="text-stone-600 leading-relaxed">
                  {c.locationDesc}
                  {audience === "ja" && (
                    <> <span className="font-medium text-amber-800" lang="th">จังหวัดอุตรดิตถ์</span>{c.locationDescSuffix}</>
                  )}
                </p>
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="aspect-video w-full relative">
                  <iframe
                    title="Uttaradit Province"
                    src={MAP_EMBED_URL}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="p-3 text-center text-stone-500 text-sm">
                  <a
                    href={MAP_LINK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 font-medium underline"
                  >
                    {c.mapOpen}
                  </a>
                </p>
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <div className="bg-white rounded-2xl border border-amber-100 p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-semibold text-stone-800">{c.climateTitle}</h2>
                <p className="text-stone-600 leading-relaxed">{c.climateDesc}</p>
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-stone-800">{c.whyTitle}</h2>
                <p className="text-stone-600 leading-relaxed">{c.whyDesc}</p>
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <div className="text-center pt-2">
                <Link
                  href="/#products"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95"
                >
                  {c.locationCta}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </FadeInBlock>
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-20">
            <FadeInBlock>
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">{c.nutritionLabel}</p>
                <h2 className="text-2xl sm:text-3xl font-light text-stone-800 tracking-tight">
                  {c.nutritionTitle}
                </h2>
                <p className="text-stone-500 leading-relaxed">{c.nutritionSub}</p>
              </div>
            </FadeInBlock>

            <FadeInBlock>
              <NutritionChart
                macros={c.macros}
                nutrients={c.nutrients}
                chartTitle={c.chartTitle}
                chartSub={c.chartSub}
                chartSource={c.chartSource}
                chartTooltip={c.chartTooltip}
              />
            </FadeInBlock>

            <div className="space-y-16 sm:space-y-20">
              {c.benefits.map(({ id, label, title, body, imageSrc, imageFirst }) => (
                <FadeInBlock key={id}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 items-center">
                    <div className={`flex justify-center ${imageFirst ? "sm:order-1" : "sm:order-2"}`}>
                      <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-stone-200/70 bg-stone-100">
                        <Image
                          src={imageSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 320px"
                        />
                      </div>
                    </div>
                    <div className={`space-y-4 ${imageFirst ? "sm:order-2" : "sm:order-1"}`}>
                      <span className="text-emerald-700 text-xs font-medium uppercase tracking-widest">
                        {label}
                      </span>
                      <h3 className="text-stone-800 text-xl sm:text-2xl font-semibold leading-tight">
                        {title}
                      </h3>
                      <p className="text-stone-600 leading-relaxed">{body}</p>
                    </div>
                  </div>
                </FadeInBlock>
              ))}
            </div>

            <FadeInBlock>
              <div className="text-center pt-2">
                <Link
                  href="/#products"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95"
                >
                  {c.nutritionCta}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </FadeInBlock>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
