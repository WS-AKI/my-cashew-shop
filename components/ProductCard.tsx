"use client";

import Image from "next/image";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product, FLAVOR_COLORS, FlavorColor } from "@/types";
import { useState } from "react";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const displayPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.sale_price! / product.price) * 100)
    : 0;

  const flavorColor =
    product.flavor_color && product.flavor_color in FLAVOR_COLORS
      ? FLAVOR_COLORS[product.flavor_color as FlavorColor]
      : null;

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-amber-100 group flex flex-col">
      {/* 商品画像 */}
      <div className="relative aspect-square bg-amber-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name_ja}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Package size={48} className="text-amber-200" />
            {flavorColor && (
              <span
                className="w-8 h-8 rounded-full shadow"
                style={{ backgroundColor: flavorColor.hex }}
              />
            )}
          </div>
        )}

        {/* セールバッジ */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {discountPct}% OFF
          </span>
        )}

        {/* セット商品バッジ */}
        {product.is_set && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            セット
          </span>
        )}

        {/* 在庫なしオーバーレイ */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-full">
              品切れ
            </span>
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="p-4 flex flex-col flex-1">
        {/* 味カラーバッジ */}
        {flavorColor && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 w-fit ${flavorColor.bg} ${flavorColor.text}`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: flavorColor.hex }}
            />
            {flavorColor.label}
          </span>
        )}

        <h3 className="font-bold text-gray-800 text-base leading-snug">
          {product.name_ja}
        </h3>

        {product.name_th && (
          <p className="text-gray-400 text-xs mt-0.5 mb-1">{product.name_th}</p>
        )}

        {product.weight_g && (
          <p className="text-amber-600 text-xs font-medium">{product.weight_g}g</p>
        )}

        {/* 価格 */}
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-3">
            {hasDiscount ? (
              <>
                <span className="text-red-500 font-bold text-xl">
                  ฿{displayPrice.toLocaleString()}
                </span>
                <span className="text-gray-400 line-through text-sm pb-0.5">
                  ฿{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-gray-800 font-bold text-xl">
                ฿{displayPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* カートに追加ボタン */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? "bg-green-500 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            <ShoppingCart size={16} />
            {added ? "✓ カートに追加しました" : "カートに入れる"}
          </button>
        </div>
      </div>
    </div>
  );
}
