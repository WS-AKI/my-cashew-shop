import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

// Suspense の fallback として使用するスケルトン画面
// 商品グリッドと同じレイアウト・カード数でガタつきを防ぐ
export default function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
