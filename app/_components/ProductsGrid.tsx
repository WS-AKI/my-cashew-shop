import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types";
import Link from "next/link";
import { ChevronRight, PackageX } from "lucide-react";
import { getAudienceFromEnv } from "@/lib/audience";
import { fetchProductsForAudience } from "@/lib/products-fetch";

type ProductsGridProps = { showViewAll?: boolean };

export default async function ProductsGrid({ showViewAll = true }: ProductsGridProps) {
  const audience = getAudienceFromEnv();

  let products: Product[];
  try {
    products = await fetchProductsForAudience(audience);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <div className="text-center py-16 px-4">
        <PackageX size={48} className="text-amber-300 mx-auto mb-3" />
        <p className="text-amber-700 font-medium">
          商品の読み込みに失敗しました。ページを再読み込みしてください。
        </p>
        <p className="text-amber-500 text-xs mt-1 font-mono">{message}</p>
      </div>
    );
  }
  const singleProducts = products.filter((p) => !p.is_set);
  const setProducts = products.filter((p) => p.is_set);

  // 商品が0件の場合
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <PackageX size={48} className="text-amber-300 mx-auto mb-3" />
        <p className="text-amber-700 font-medium">
          ただいま商品の準備中です。しばらくお待ちください。
        </p>
      </div>
    );
  }

  const labels = {
    ja: {
      singleBadge: "単品",
      singleTitle: "1袋から選べる",
      singleSub: "รสเดี่ยว / เลือกซื้อเป็นถุง",
      setBadge: "詰め合わせ",
      setTitle: "組み合わせでお得",
      setSub: "เซ็ตผสมรส / ชุดคุ้มค่า",
      viewAll: "すべての商品を見る",
    },
    th: {
      singleBadge: "เดี่ยว",
      singleTitle: "เลือกซื้อเป็นถุง",
      singleSub: "รสเดี่ยว",
      setBadge: "เซ็ต",
      setTitle: "ชุดคุ้มค่า",
      setSub: "ผสมรส",
      viewAll: "ดูสินค้าทั้งหมด",
    },
  };
  const t = labels[audience];

  return (
    <>
      {singleProducts.length > 0 && (
        <section
          id="single"
          aria-label={audience === "ja" ? "単品商品" : "สินค้าเดี่ยว"}
          className="rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-6 sm:p-8 mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-amber-400 text-amber-950 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              {t.singleBadge}
            </span>
            <h3 className="text-xl font-extrabold text-amber-950">
              {t.singleTitle}
              <span className="block text-amber-600 text-sm font-normal mt-0.5">{t.singleSub}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {singleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {setProducts.length > 0 && (
        <section
          id="set"
          aria-label={audience === "ja" ? "詰め合わせ・お得セット" : "ชุดเซ็ต"}
          className="rounded-2xl bg-orange-50/80 border-2 border-orange-200 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              {t.setBadge}
            </span>
            <h3 className="text-xl font-extrabold text-amber-950">
              {t.setTitle}
              <span className="block text-orange-600 text-sm font-normal mt-0.5">{t.setSub}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {setProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {showViewAll && (
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-bold px-8 py-3 rounded-xl transition-all"
          >
            {t.viewAll}
            <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </>
  );
}
