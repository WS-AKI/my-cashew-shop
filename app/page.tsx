import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import HealthBenefitsSection from "@/components/home/HealthBenefitsSection";
import ProductsGrid from "@/app/_components/ProductsGrid";
import ProductsGridSkeleton from "@/app/_components/ProductsGridSkeleton";

/** 商品は Supabase から取得するため、ビルド時ではなくリクエスト時にレンダリングする */
export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Leaf,
    title: "ウタラディット産プレミアム",
    desc: "タイ・ウタラディット県産の厳選されたカシューナッツのみを使用。",
  },
  {
    icon: ShieldCheck,
    title: "品質保証",
    desc: "毎ロット品質検査済み。鮮度にこだわり真空パックでお届け。",
  },
  {
    icon: Truck,
    title: "迅速発送",
    desc: "ご入金確認後、1〜2営業日以内に発送いたします。",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <HeroCarousel />

      <main className="flex-1">
        {/* ─── ヒーローセクション ──────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
            <span className="inline-block bg-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              🌿 Sam Sian Cashew Nuts — Uttaradit, Thailand
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-950 leading-tight tracking-tight mb-6">
              タイ・ウタラディット県の大地で、
              <br className="hidden sm:block" />
              <span className="text-amber-600">大切に育てました。</span>
            </h1>

            <p className="text-amber-800/70 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
              豊かな自然と温かい気候に恵まれた
              ウタラディットの大地で育ったカシューナッツを、
              産地直送でお届けします。
              一度食べたら忘れられない、本物の味をぜひ。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#products"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                商品を見る
                <ChevronRight size={20} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-amber-800 font-bold text-lg px-8 py-4 rounded-2xl border border-amber-200 transition-all active:scale-95"
              >
                私たちについて
              </Link>
            </div>

          </div>
        </section>

        {/* ─── 特徴セクション ──────────────────────────────────── */}
        <section className="bg-amber-900 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="bg-amber-700 rounded-xl p-3 flex-shrink-0">
                  <Icon size={22} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{title}</h3>
                  <p className="text-amber-300/70 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ターゲット別健康効果（Zパターン） ─────────────────── */}
        <HealthBenefitsSection />

        {/* ─── 商品一覧セクション（Supabase 本番データ） ─────────── */}
        <section id="products" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
              Our Products
            </span>
            <h2 className="text-3xl font-extrabold text-amber-950 mt-2 mb-3">
              人気商品ラインナップ
            </h2>
            <p className="text-amber-700/60 max-w-md mx-auto text-sm leading-relaxed mb-6">
              全商品、タイ・ウタラディット県産を使用。
              素材本来の旨みを引き出すために、丁寧に焙煎しています。
            </p>
            <nav className="flex flex-wrap justify-center gap-2" aria-label="商品セクションへジャンプ">
              <a
                href="#single"
                className="px-4 py-2 rounded-full bg-amber-200 text-amber-900 text-sm font-bold hover:bg-amber-300 transition-colors"
              >
                単品
              </a>
              <a
                href="#set"
                className="px-4 py-2 rounded-full bg-orange-200 text-orange-900 text-sm font-bold hover:bg-orange-300 transition-colors"
              >
                詰め合わせ
              </a>
            </nav>
          </div>

          {/*
            Suspense で囲むことで:
            - データ取得中 → ProductsGridSkeleton（グレーのアニメカード6枚）を表示
            - データ取得完了 → ProductsGrid（実商品カード）に切り替わる
          */}
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid />
          </Suspense>
        </section>

      
      </main>

      <Footer />
    </div>
  );
}
