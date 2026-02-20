"use client";

import Image from "next/image";
import { ShoppingCart, Package, Star, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product, FLAVOR_COLORS, FlavorColor, FlavorSelection, PriceVariant } from "@/types";
import { SHOP_TEXT } from "@/lib/shop-config";
import { useState } from "react";

const T = SHOP_TEXT.cart;
const ALL_FLAVORS = Object.keys(FLAVOR_COLORS) as FlavorColor[];

type Props = { product: Product };

function getVariants(product: Product): PriceVariant[] {
  if (!product.price_variants || !Array.isArray(product.price_variants)) return [];
  return product.price_variants.filter((v) => v.size_g > 0 && v.price > 0);
}

function emptyFlavors(): FlavorSelection {
  const sel = {} as FlavorSelection;
  for (const f of ALL_FLAVORS) sel[f] = 0;
  return sel;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const variants = getVariants(product);
  const hasVariants = !product.is_set && variants.length > 0;
  const isSet = product.is_set;
  const setBagCount = product.set_quantity ?? 0;

  const [selectedSize, setSelectedSize] = useState<number | null>(
    hasVariants ? variants[0].size_g : null
  );
  const [qty, setQty] = useState(1);
  const [flavors, setFlavors] = useState<FlavorSelection>(emptyFlavors);

  const flavorTotal = ALL_FLAVORS.reduce((sum, f) => sum + flavors[f], 0);
  const flavorsFull = flavorTotal >= setBagCount;

  const currentVariant = hasVariants
    ? variants.find((v) => v.size_g === selectedSize) ?? variants[0]
    : null;

  const variantHasSale =
    currentVariant?.sale_price != null &&
    currentVariant.sale_price < currentVariant.price;

  const displayPrice = currentVariant
    ? variantHasSale ? currentVariant.sale_price! : currentVariant.price
    : product.sale_price ?? product.price;

  const originalPrice = currentVariant
    ? currentVariant.price
    : product.price;

  const hasDiscount = currentVariant
    ? variantHasSale
    : product.sale_price !== null && product.sale_price < product.price;

  const discountPct = hasDiscount
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0;

  const flavor =
    product.flavor_color && product.flavor_color in FLAVOR_COLORS
      ? FLAVOR_COLORS[product.flavor_color as FlavorColor]
      : null;

  function handleFlavorChange(f: FlavorColor, delta: number) {
    setFlavors((prev) => {
      const next = { ...prev };
      const newVal = Math.max(0, next[f] + delta);
      const otherTotal = flavorTotal - prev[f];
      next[f] = Math.min(newVal, setBagCount - otherTotal);
      return next;
    });
  }

  function handleAddToCart() {
    const flavorData = isSet && setBagCount > 0 ? { ...flavors } : null;
    addToCart(product, qty, hasVariants ? selectedSize : null, flavorData);
    setAdded(true);
    setQty(1);
    if (isSet) setFlavors(emptyFlavors());
    setTimeout(() => setAdded(false), 2000);
  }

  const canAdd = isSet && setBagCount > 0
    ? product.stock > 0 && flavorsFull
    : product.stock > 0;

  return (
    <>
      {added && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-800 text-white font-bold px-6 py-3 rounded-full shadow-lg"
        >
          {T.added.ja}
        </div>
      )}
      <div
        className={`relative flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-white group ${
          flavor ? flavor.cardBorder : "border-amber-100"
        }`}
      >
        {product.is_promotion && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            <Star size={11} fill="white" />
            おすすめ
          </div>
        )}

        <div
          className={`relative aspect-square overflow-hidden flex-shrink-0 ${
            flavor ? flavor.cardBg : "bg-amber-50"
          }`}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name_ja}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Package
                size={52}
                className={flavor ? flavor.text : "text-amber-200"}
                strokeWidth={1.5}
              />
              {flavor && (
                <span
                  className="w-10 h-10 rounded-full shadow-md ring-2 ring-white"
                  style={{ backgroundColor: flavor.hex }}
                />
              )}
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow">
              {discountPct}% OFF
            </span>
          )}

          {isSet && !product.is_promotion && (
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              セット
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-white text-gray-800 font-bold text-sm px-5 py-2 rounded-full shadow-lg">
                品切れ中
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-4">
          {flavor && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 w-fit ${flavor.bg} ${flavor.text}`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: flavor.hex }}
              />
              {flavor.label}
              <span className="font-normal opacity-70">/ {flavor.labelTh}</span>
            </span>
          )}

          <h3 className="font-extrabold text-gray-800 text-base leading-snug">
            {product.name_ja}
          </h3>

          {product.name_th && (
            <p className="text-gray-400 text-xs mt-0.5 font-medium">
              {product.name_th}
            </p>
          )}

          {product.description_ja && (
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              {product.description_ja}
              {product.description_th && (
                <span className="block text-gray-400 text-[10px] mt-0.5">{product.description_th}</span>
              )}
            </p>
          )}

          {!hasVariants && !isSet && product.weight_g && (
            <p className="text-amber-600 text-xs font-semibold mb-1">
              {product.weight_g}g
            </p>
          )}

          {isSet && product.weight_g && (
            <p className="text-amber-600 text-xs font-semibold mb-1">
              {product.weight_g}g
            </p>
          )}

          <div className="mt-auto space-y-3">
            {/* Size selector (non-set) */}
            {hasVariants && (
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => (
                  <button
                    key={v.size_g}
                    type="button"
                    onClick={() => setSelectedSize(v.size_g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      selectedSize === v.size_g
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {v.size_g}g
                  </button>
                ))}
              </div>
            )}

            {/* Flavor picker (set products) */}
            {isSet && setBagCount > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-orange-700">
                  味を選んでください ({flavorTotal}/{setBagCount})
                  <span className="text-orange-400 font-normal ml-1">เลือกรส</span>
                </p>
                <div className="space-y-1.5">
                  {ALL_FLAVORS.map((f) => {
                    const c = FLAVOR_COLORS[f];
                    return (
                      <div
                        key={f}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                          {c.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleFlavorChange(f, -1)}
                            disabled={flavors[f] <= 0}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {flavors[f]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFlavorChange(f, 1)}
                            disabled={flavorsFull}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!flavorsFull && (
                  <p className="text-[10px] text-orange-500">
                    あと{setBagCount - flavorTotal}袋選んでください
                  </p>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-red-500 font-extrabold text-2xl leading-none">
                    ฿{displayPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-400 line-through text-sm pb-0.5">
                    ฿{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-red-500 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                </>
              ) : (
                <span className="text-gray-800 font-extrabold text-2xl leading-none">
                  ฿{displayPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Quantity selector + add to cart */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 py-2 text-sm font-bold text-gray-800 min-w-[2rem] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                  disabled={qty >= 10}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canAdd}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-95
                  disabled:opacity-40 disabled:cursor-not-allowed ${
                    added
                      ? "bg-green-500 text-white scale-[0.98]"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
              >
                <ShoppingCart size={16} />
                {added ? `✓ ${T.added.ja}` : T.add.ja}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
