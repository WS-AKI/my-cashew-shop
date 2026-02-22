import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types";
import Link from "next/link";
import { ChevronRight, PackageX } from "lucide-react";

type ProductsGridProps = { showViewAll?: boolean };

export default async function ProductsGrid({ showViewAll = true }: ProductsGridProps) {
  const supabase = await createClient();

  // お客様向け: タイ人向け価格（thai_price）は含めない（管理者ページ専用）
  const { data, error } = await supabase
    .from("products")
    .select("id, name_ja, name_th, description_ja, description_th, price, sale_price, image_url, gallery_urls, stock, is_active, is_promotion, display_order, flavor_color, weight_g, is_set, set_quantity, price_variants, created_at")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false }); // display_order が同じ場合の補助ソート

  // エラー時のフォールバック
  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <PackageX size={48} className="text-amber-300 mx-auto mb-3" />
        <p className="text-amber-700 font-medium">
          商品の読み込みに失敗しました。ページを再読み込みしてください。
        </p>
        <p className="text-amber-500 text-xs mt-1 font-mono">{error.message}</p>
      </div>
    );
  }

  const products = (data ?? []) as Product[];
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

  return (
    <>
      {/* 単品エリア：1袋から選べる */}
      {singleProducts.length > 0 && (
        <section
          id="single"
          aria-label="単品商品"
          className="rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-6 sm:p-8 mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-amber-400 text-amber-950 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              単品
            </span>
            <h3 className="text-xl font-extrabold text-amber-950">
              1袋から選べる
              <span className="block text-amber-600 text-sm font-normal mt-0.5">รสเดี่ยว / เลือกซื้อเป็นถุง</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {singleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 詰め合わせエリア：組み合わせでお得 */}
      {setProducts.length > 0 && (
        <section
          id="set"
          aria-label="詰め合わせ・お得セット"
          className="rounded-2xl bg-orange-50/80 border-2 border-orange-200 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              詰め合わせ
            </span>
            <h3 className="text-xl font-extrabold text-amber-950">
              組み合わせでお得
              <span className="block text-orange-600 text-sm font-normal mt-0.5">เซ็ตผสมรส / ชุดคุ้มค่า</span>
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
            すべての商品を見る
            <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </>
  );
}
