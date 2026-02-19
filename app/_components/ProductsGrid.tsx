import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types";
import Link from "next/link";
import { ChevronRight, PackageX } from "lucide-react";

export default async function ProductsGrid() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
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
      {/* 商品グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* もっと見るボタン */}
      <div className="text-center mt-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-bold px-8 py-3 rounded-xl transition-all"
        >
          すべての商品を見る
          <ChevronRight size={18} />
        </Link>
      </div>
    </>
  );
}
