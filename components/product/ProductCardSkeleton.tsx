export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border-2 border-gray-100 bg-white shadow-sm animate-pulse">
      {/* 画像プレースホルダー */}
      <div className="aspect-square bg-gray-100" />

      {/* テキストプレースホルダー */}
      <div className="p-4 space-y-3">
        {/* フレーバーバッジ */}
        <div className="h-5 w-16 bg-gray-100 rounded-full" />

        {/* 商品名（日本語） */}
        <div className="h-5 w-4/5 bg-gray-100 rounded-lg" />

        {/* 商品名（タイ語） */}
        <div className="h-3.5 w-3/5 bg-gray-100 rounded-lg" />

        {/* 内容量 */}
        <div className="h-3.5 w-10 bg-gray-100 rounded-lg" />

        {/* 説明（2行） */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-4/5 bg-gray-100 rounded" />
        </div>

        {/* 価格 */}
        <div className="h-8 w-24 bg-gray-100 rounded-lg pt-2" />

        {/* ボタン */}
        <div className="h-11 w-full bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
