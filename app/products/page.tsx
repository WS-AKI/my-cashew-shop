import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsGrid from "@/app/_components/ProductsGrid";
import ProductsGridSkeleton from "@/app/_components/ProductsGridSkeleton";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Link
            href="/#products"
            className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-900 font-semibold text-sm"
          >
            <ChevronLeft size={18} />
            トップへ戻る
          </Link>
        </div>
        <div className="text-center mb-10">
          <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
            Our Products
          </span>
          <h1 className="text-3xl font-extrabold text-amber-950 mt-2 mb-3">
            商品一覧
          </h1>
          <p className="text-amber-700/60 max-w-md mx-auto text-sm leading-relaxed mb-6">
            単品は1袋から、詰め合わせは組み合わせでお得に。タイ・ウタラディット県産を使用しています。
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
        <Suspense fallback={<ProductsGridSkeleton />}>
          <ProductsGrid showViewAll={false} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
