"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight, Leaf, Sun, Heart, MapPin,
  Sparkles, Activity, Sprout,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Cell, LabelList, Tooltip,
} from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FadeInBlock from "@/components/home/FadeInBlock";

// ─── 型 ─────────────────────────────────────────────────────────
type Tab = "about" | "nutrition";

type Value = { Icon: LucideIcon; bg: string; iconColor: string; title: string; desc: string };
type Benefit = { id: string; label: string; Icon: LucideIcon; imageFirst: boolean; title: string; body: string };
type Nutrient = { name: string; pct: number; color: string; unit: string };
type Macro = { label: string; value: string; unit: string; bg: string; text: string };

// ─── データ ──────────────────────────────────────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: "about",     label: "私たちについて" },
  { id: "nutrition", label: "豆知識・栄養"   },
];

const VALUES: Value[] = [
  { Icon: Leaf,   bg: "bg-green-100", iconColor: "text-green-600", title: "自然の恵み",      desc: "化学肥料に頼らず、ウタラディットの豊かな土壌と太陽の光で育ったカシューナッツです。" },
  { Icon: Sun,    bg: "bg-amber-100", iconColor: "text-amber-600", title: "丁寧な焙煎",      desc: "素材本来の旨みを最大限に引き出すため、一つひとつ丁寧に焙煎しています。" },
  { Icon: Heart,  bg: "bg-rose-100",  iconColor: "text-rose-500",  title: "産地直送",        desc: "農園から直接お届けするので、いつでも新鮮。中間業者を通さない分、お求めやすい価格でご提供します。" },
  { Icon: MapPin, bg: "bg-blue-100",  iconColor: "text-blue-600",  title: "ウタラディット県", desc: "タイ北部に位置するウタラディット県は、高品質なカシューナッツの産地として知られています。" },
];

const MACROS: Macro[] = [
  { label: "カロリー",   value: "157", unit: "kcal", bg: "bg-amber-50",   text: "text-amber-700"  },
  { label: "脂質",      value: "12",  unit: "g",    bg: "bg-stone-50",   text: "text-stone-700"  },
  { label: "タンパク質", value: "5",   unit: "g",    bg: "bg-emerald-50", text: "text-emerald-700" },
  { label: "炭水化物",  value: "9",   unit: "g",    bg: "bg-sky-50",     text: "text-sky-700"    },
];

const NUTRIENTS: Nutrient[] = [
  { name: "銅",          pct: 69, color: "#b45309", unit: "0.62 mg" },
  { name: "マンガン",    pct: 20, color: "#0891b2", unit: "0.47 mg" },
  { name: "マグネシウム", pct: 17, color: "#059669", unit: "74 mg"  },
  { name: "亜鉛",        pct: 15, color: "#7c3aed", unit: "1.6 mg" },
  { name: "リン",        pct: 13, color: "#d97706", unit: "166 mg" },
  { name: "鉄分",        pct: 11, color: "#dc2626", unit: "1.9 mg" },
  { name: "タンパク質",  pct: 10, color: "#65a30d", unit: "5 g"    },
  { name: "ビタミンK",   pct: 8,  color: "#9333ea", unit: "9.7 μg" },
];

const BENEFITS: Benefit[] = [
  {
    id: "beauty",   label: "美容",      Icon: Sparkles, imageFirst: true,
    title: "1日10粒の『食べる美容液』",
    body:  "亜鉛や鉄分、良質なオレイン酸が内側からの潤いをサポート。罪悪感のないギルトフリーなご褒美に。",
  },
  {
    id: "recovery", label: "リカバリー", Icon: Activity, imageFirst: false,
    title: "日々のパフォーマンスを底上げする天然のエナジーフード",
    body:  "良質な植物性タンパク質とマグネシウムが、ハードな運動後や仕事の疲労回復をサポートします。",
  },
  {
    id: "snack",    label: "おやつに",   Icon: Sprout,   imageFirst: true,
    title: "お菓子を変えるだけで、ぐんぐん育つ",
    body:  "スナック菓子の代わりに。カルシウムの吸収を助けるミネラルが豊富で、適度な歯ごたえが噛む力と集中力を育みます。",
  },
];

// ─── 栄養グラフ ───────────────────────────────────────────────────
function NutritionChart() {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
      <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Nutrition Facts</p>
      <h3 className="text-xl sm:text-2xl font-semibold text-stone-800 mt-1">
        1回分（28g・約18粒）の栄養素
      </h3>
      <p className="text-sm text-stone-400 mt-1">1日推奨量に対する割合（%DV）</p>

      {/* マクロ栄養素 サマリーカード */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 mb-8">
        {MACROS.map(({ label, value, unit, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 sm:p-4 text-center`}>
            <p className={`text-2xl sm:text-3xl font-bold ${text}`}>{value}</p>
            <p className="text-xs text-stone-400 font-medium">{unit}</p>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate">{label}</p>
          </div>
        ))}
      </div>

      {/* 棒グラフ */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          layout="vertical"
          data={NUTRIENTS}
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
            formatter={(value: any) => [`${value ?? ""}%`, "1日推奨量"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 13 }}
          />
          <Bar
            dataKey="pct"
            radius={[0, 6, 6, 0]}
            background={{ fill: "#f5f5f4", radius: [0, 6, 6, 0] } as object}
          >
            {NUTRIENTS.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.82} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: number | string) => `${v}%`}
              style={{ fontSize: 12, fontWeight: 700, fill: "#57534e" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-stone-400 mt-3">
        出典: USDA FoodData Central（28g / 約18粒あたり）
      </p>
    </div>
  );
}

// ─── 私たちについてタブ ──────────────────────────────────────────
function AboutTab() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-12">
      <FadeInBlock>
        <div className="text-center space-y-5">
          <h2 className="text-2xl font-extrabold text-amber-950">Sam Sian Cashew Nuts</h2>
          <p className="text-amber-800/70 leading-relaxed">
            タイ北部ウタラディット県。豊かな自然と温暖な気候に恵まれたこの地で、
            私たちはカシューナッツを大切に育てています。
          </p>
          <p className="text-amber-800/60 text-sm leading-relaxed">
            ถั่วลิสงจากจังหวัดอุตรดิตถ์ ภาคเหนือของประเทศไทย
            เราดูแลต้นมะม่วงหิมพานต์ด้วยความรักและใส่ใจ
          </p>
        </div>
      </FadeInBlock>

      <FadeInBlock>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map(({ Icon, bg, iconColor, title, desc }) => (
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
            商品を見る
            <ChevronRight size={18} />
          </Link>
        </div>
      </FadeInBlock>
    </div>
  );
}

// ─── 豆知識・栄養タブ ────────────────────────────────────────────
function NutritionTab() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-20">
      {/* イントロ */}
      <FadeInBlock>
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">Trivia</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-800 tracking-tight">
            カシューナッツが体に嬉しい理由
          </h2>
          <p className="text-stone-500 leading-relaxed">
            小さな一粒に、美容・健康・活力を支える栄養素が凝縮されています。
          </p>
        </div>
      </FadeInBlock>

      {/* 栄養グラフ */}
      <FadeInBlock>
        <NutritionChart />
      </FadeInBlock>

      {/* 健康・美容効果 Zパターン */}
      <div className="space-y-16 sm:space-y-20">
        {BENEFITS.map(({ id, label, title, body, Icon, imageFirst }) => (
          <FadeInBlock key={id}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 items-center">
              {/* アイコンビジュアル */}
              <div className={`flex justify-center ${imageFirst ? "sm:order-1" : "sm:order-2"}`}>
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-stone-100 border border-stone-200/70 flex items-center justify-center">
                  <Icon
                    className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-700/60"
                    strokeWidth={1.2}
                    aria-hidden
                  />
                </div>
              </div>
              {/* テキスト */}
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

      {/* CTA */}
      <FadeInBlock>
        <div className="text-center pt-2">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95"
          >
            商品を見る
            <ChevronRight size={18} />
          </Link>
        </div>
      </FadeInBlock>
    </div>
  );
}

// ─── ページ本体 ───────────────────────────────────────────────────
export default function AboutPage() {
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
        <nav className="max-w-4xl mx-auto flex" aria-label="コンテンツタブ">
          {TABS.map(({ id, label }) => (
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
        {activeTab === "about"     && <AboutTab />}
        {activeTab === "nutrition" && <NutritionTab />}
      </main>

      <Footer />
    </div>
  );
}
