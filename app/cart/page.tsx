"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getItemPrice, getItemOriginalPrice, FLAVOR_COLORS, FlavorColor, setFlavorSummary, serializeSetFlavors } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { SHOP_TEXT } from "@/lib/shop-config";
import { Package, Plus, Minus, Trash2, ChevronRight } from "lucide-react";

const T = SHOP_TEXT.cart;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, discountAmount, total, discountRate } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Package size={64} className="text-amber-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              <DualLanguageLabel primary={T.empty.ja} secondary={T.empty.th} />
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              <DualLanguageLabel primary={T.emptyHint.ja} secondary={T.emptyHint.th} />
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
            >
              {T.viewProducts.ja}
              <span className="text-white/80 text-xs">({T.viewProducts.th})</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col pb-24 md:pb-8">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-extrabold text-amber-950 mb-6">
          <DualLanguageLabel primary={T.title.ja} secondary={T.title.th} />
        </h1>

        <ul className="space-y-4">
          {items.map((item) => {
            const { product, quantity, selectedSizeG, selectedFlavors } = item;
            const unitPrice = getItemPrice(item);
            const lineTotal = unitPrice * quantity;
            const flavor = product.flavor_color && product.flavor_color in FLAVOR_COLORS
              ? FLAVOR_COLORS[product.flavor_color as FlavorColor]
              : null;
            const flavorList = setFlavorSummary(selectedFlavors);
            const saltSuffix = item.saltOption ? `-${item.saltOption}` : "";
            const itemKey = `${product.id}-${selectedSizeG ?? "set"}-${serializeSetFlavors(selectedFlavors)}${saltSuffix}`;
            return (
              <li
                key={itemKey}
                className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden flex gap-4 p-4"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name_ja}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-amber-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">
                    {product.name_ja}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {flavor && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${flavor.bg} ${flavor.text}`}>
                        {flavor.label}
                      </span>
                    )}
                    {selectedSizeG && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {selectedSizeG}g
                      </span>
                    )}
                  </div>
                  {flavorList.length > 0 && (
                    <p className="text-[10px] text-orange-600 mt-0.5 leading-snug">
                      {flavorList.join(", ")}
                    </p>
                  )}
                  {!product.is_set && product.flavor_color === "original" && item.saltOption && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {item.saltOption === "with_salt" ? "塩あり" : "塩なし"}
                    </p>
                  )}
                  {(() => {
                    const origPrice = getItemOriginalPrice(item);
                    const onSale = origPrice > unitPrice;
                    return (
                      <p className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {onSale && (
                          <span className="text-gray-400 line-through text-xs">
                            ฿{origPrice.toLocaleString()}
                          </span>
                        )}
                        <span className={`font-semibold ${onSale ? "text-red-500" : "text-amber-600"}`}>
                          ฿{unitPrice.toLocaleString()}
                        </span>
                        <span className="text-gray-500">x{quantity} =</span>
                        <span className={`font-bold ${onSale ? "text-red-500" : "text-amber-600"}`}>
                          ฿{lineTotal.toLocaleString()}
                        </span>
                        {onSale && (
                          <span className="text-red-500 text-[10px] font-bold bg-red-50 px-1.5 py-0.5 rounded-full">
                            {Math.round((1 - unitPrice / origPrice) * 100)}% OFF
                          </span>
                        )}
                      </p>
                    );
                  })()}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1, selectedSizeG, selectedFlavors, item.saltOption ?? null)}
                      className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center active:scale-95"
                      aria-label={T.decrease.ja}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="min-w-[2rem] text-center font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1, selectedSizeG, selectedFlavors, item.saltOption ?? null)}
                      className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center active:scale-95"
                      aria-label={T.increase.ja}
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id, selectedSizeG, selectedFlavors, item.saltOption ?? null)}
                      className="ml-auto w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-95"
                      aria-label={T.remove.ja}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 p-5 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span><DualLanguageLabel primary={T.subtotal.ja} secondary={T.subtotal.th} /></span>
            <span>฿{subtotal.toLocaleString()}</span>
          </div>
          {discountRate > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span><DualLanguageLabel primary={`${T.discount.ja} (${(discountRate * 100).toFixed(0)}%)`} secondary={T.discount.th} /></span>
              <span>−฿{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-amber-950 text-xl pt-2 border-t border-amber-100">
            <span><DualLanguageLabel primary={T.total.ja} secondary={T.total.th} /></span>
            <span>฿{total.toLocaleString()}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50/95 backdrop-blur border-t border-amber-100 md:relative md:max-w-2xl md:mx-auto md:mt-6 md:border md:rounded-2xl md:border-amber-100">
        <Link
          href="/checkout"
          className="block w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center text-lg active:scale-[0.98]"
        >
          {T.proceedToCheckout.ja}
          <span className="text-white/80 text-xs ml-1">({T.proceedToCheckout.th})</span>
          <ChevronRight size={20} className="inline-block ml-1 align-middle" />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
