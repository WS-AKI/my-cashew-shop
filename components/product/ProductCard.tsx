"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Package, Star, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import { canPurchaseVipProduct, getProductVipRequiredTier } from "@/lib/loyalty/vip-product-access";
import { Product, FLAVOR_COLORS, FlavorColor, SetFlavorKey, SetFlavorSelection, SET_FLAVOR_DISPLAY, SaltOption, PriceVariant } from "@/types";
import { SHOP_TEXT } from "@/lib/shop-config";
import { useState, useMemo } from "react";
import ProductReviews from "./ProductReviews";
import { useAudience } from "@/context/AudienceContext";
import { useLanguage } from "@/context/LanguageContext";
import type { VipTier } from "@/lib/loyalty/sync-loyalty-profile";

const T = SHOP_TEXT.cart;
const P = SHOP_TEXT.product;
const V = SHOP_TEXT.vip;
const ALL_SET_FLAVORS: SetFlavorKey[] = ["original_salt", "original_nosalt", "cheese", "bbq", "nori", "tomyum"];

function tierDisplayName(audience: "ja" | "th", tier: VipTier | null, loggedIn: boolean): string {
  if (!loggedIn) return V.tierGuest[audience];
  if (tier === "gold") return V.tierGold[audience];
  if (tier === "silver") return V.tierSilver[audience];
  return V.tierNormal[audience];
}

type Props = { product: Product };

function getVariants(product: Product): PriceVariant[] {
  if (!product.price_variants || !Array.isArray(product.price_variants)) return [];
  return product.price_variants.filter((v) => v.size_g > 0 && v.price > 0);
}

function emptySetFlavors(): SetFlavorSelection {
  const sel = {} as SetFlavorSelection;
  for (const f of ALL_SET_FLAVORS) sel[f] = 0;
  return sel;
}

function readVipPriceCandidate(product: Product, selectedVariant: PriceVariant | null): number | null {
  const variantAny = selectedVariant as (PriceVariant & {
    vip_price?: number | null;
    silver_price?: number | null;
    member_price?: number | null;
  }) | null;
  const productAny = product as Product & {
    vip_price?: number | null;
    silver_price?: number | null;
    member_price?: number | null;
  };
  const fromVariant =
    variantAny?.vip_price ?? variantAny?.silver_price ?? variantAny?.member_price ?? null;
  const fromProduct =
    productAny.vip_price ?? productAny.silver_price ?? productAny.member_price ?? null;
  const n = Number(fromVariant ?? fromProduct);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const audience = useAudience();
  const auth = useAuthSessionOptional();
  const { language, t: tLang } = useLanguage();
  const [added, setAdded] = useState(false);

  const loggedIn = Boolean(auth?.user);
  const vipTier = auth?.vipTier ?? null;
  const canBuyVip = canPurchaseVipProduct(product, vipTier, loggedIn);
  const vipLocked = !canBuyVip;
  const requiredTier = getProductVipRequiredTier(product);
  const tierName = tierDisplayName(audience, vipTier, loggedIn);

  const productNamePrimary = audience === "th" && product.name_th ? product.name_th : product.name_ja;
  const productNameSecondary = audience === "th" ? product.name_ja : product.name_th;
  const productDescPrimary = audience === "th" && product.description_th ? product.description_th : product.description_ja;
  const productDescSecondary = audience === "th" ? product.description_ja : product.description_th;

  const variants = getVariants(product);
  const hasVariants = !product.is_set && variants.length > 0;
  const isSet = product.is_set;
  /** 詰め合わせで set_quantity が未設定のときは 1 袋として扱い、味選択・カート追加を可能にする */
  const setBagCount = isSet ? (product.set_quantity ?? 0) || 1 : 0;

  const [selectedSize, setSelectedSize] = useState<number | null>(
    hasVariants ? variants[0].size_g : null
  );
  const [qty, setQty] = useState(1);
  const [flavors, setFlavors] = useState<SetFlavorSelection>(emptySetFlavors);
  const isOriginalSingle = !isSet && product.flavor_color === "original";
  const [saltOption, setSaltOption] = useState<SaltOption>("with_salt");

  const flavorTotal = ALL_SET_FLAVORS.reduce((sum, f) => sum + flavors[f], 0);
  const flavorsFull = flavorTotal >= setBagCount;

  const currentVariant = hasVariants
    ? variants.find((v) => v.size_g === selectedSize) ?? variants[0]
    : null;

  const displayImageUrl = currentVariant?.image_url || product.image_url;

  const galleryImages = useMemo(() => {
    const imgs: string[] = [];
    if (displayImageUrl) imgs.push(displayImageUrl);
    const gallery = product.gallery_urls;
    if (Array.isArray(gallery)) {
      for (const url of gallery) {
        if (url && !imgs.includes(url)) imgs.push(url);
      }
    }
    return imgs;
    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- product.gallery_urls is from props, stable per product
  }, [displayImageUrl, product.gallery_urls]);

  const [galleryIdx, setGalleryIdx] = useState(0);
  const safeIdx = galleryImages.length > 0 ? galleryIdx % galleryImages.length : 0;

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
  const vipPriceFromData = readVipPriceCandidate(product, currentVariant);
  const vipPriceTeaser =
    vipPriceFromData ??
    Math.max(1, Math.floor(displayPrice * (requiredTier === "gold" ? 0.9 : 0.93)));
  const vipSavingPct = Math.max(
    1,
    Math.round((1 - vipPriceTeaser / Math.max(1, displayPrice)) * 100),
  );

  const flavor =
    product.flavor_color && product.flavor_color in FLAVOR_COLORS
      ? FLAVOR_COLORS[product.flavor_color as FlavorColor]
      : null;

  function handleFlavorChange(f: SetFlavorKey, delta: number) {
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
    const salt = isOriginalSingle ? saltOption : null;
    addToCart(product, qty, hasVariants ? selectedSize : null, flavorData, salt);
    setAdded(true);
    setQty(1);
    if (isSet) setFlavors(emptySetFlavors());
    setTimeout(() => setAdded(false), 2000);
  }

  const canAdd =
    !vipLocked &&
    (isSet && setBagCount > 0 ? product.stock > 0 && flavorsFull : product.stock > 0);

  return (
    <>
      {added && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-800 text-white font-bold px-6 py-3 rounded-full shadow-lg"
        >
          {language === "en" ? tLang.product.added : T.added[audience]}
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
            {P.recommended[audience]}
          </div>
        )}

        <div
          className={`relative aspect-square overflow-hidden flex-shrink-0 ${
            flavor ? flavor.cardBg : "bg-amber-50"
          }`}
        >
          {galleryImages.length > 0 ? (
            <>
              <Image
                src={galleryImages[safeIdx]}
                alt={productNamePrimary}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500"
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setGalleryIdx((i) => (i - 1 + galleryImages.length) % galleryImages.length); }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setGalleryIdx((i) => (i + 1) % galleryImages.length); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {galleryImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setGalleryIdx(i); }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === safeIdx ? "bg-white scale-125 shadow" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
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
              {P.set[audience]}
            </span>
          )}

          {requiredTier === "gold" && (
            <span className="absolute bottom-3 left-3 z-10 text-[9px] font-medium uppercase tracking-[0.2em] text-white/95 bg-stone-900/35 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/10">
              {V.goldRibbon[audience]}
            </span>
          )}
          {requiredTier === "silver" && (
            <span className="absolute bottom-3 left-3 z-10 text-[9px] font-medium uppercase tracking-[0.2em] text-white/95 bg-slate-700/40 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/15">
              {V.silverRibbon[audience]}
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-white text-gray-800 font-bold text-sm px-5 py-2 rounded-full shadow-lg">
                {P.outOfStock[audience]}
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
              {audience === "th" ? flavor.labelTh : flavor.label}
              <span className="font-normal opacity-70">/ {audience === "th" ? flavor.label : flavor.labelTh}</span>
            </span>
          )}

          <h3 className="font-extrabold text-gray-800 text-base leading-snug">
            {productNamePrimary}
          </h3>

          {productNameSecondary && (
            <p className="text-gray-400 text-xs mt-0.5 font-medium">
              {productNameSecondary}
            </p>
          )}

          {(productDescPrimary || productDescSecondary) && (
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              {productDescPrimary}
              {productDescSecondary && (
                <span className="block text-gray-400 text-[10px] mt-0.5">{productDescSecondary}</span>
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

          {/* 単品オリジナル: 塩あり/塩なし */}
          {isOriginalSingle && (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-gray-600">{P.saltLabel[audience]}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`salt-${product.id}`}
                  checked={saltOption === "with_salt"}
                  onChange={() => setSaltOption("with_salt")}
                  className="text-amber-500"
                />
                <span className="text-sm font-medium">{P.saltWith[audience]}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`salt-${product.id}`}
                  checked={saltOption === "no_salt"}
                  onChange={() => setSaltOption("no_salt")}
                  className="text-amber-500"
                />
                <span className="text-sm font-medium">{P.saltWithout[audience]}</span>
              </label>
            </div>
          )}

          <div className="mt-auto space-y-3">
            {/* Size selector (non-set) */}
            {hasVariants && (
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => (
                  <button
                    key={v.size_g}
                    type="button"
                    onClick={() => { setSelectedSize(v.size_g); setGalleryIdx(0); }}
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
                  {P.chooseFlavors[audience]} ({flavorTotal}/{setBagCount})
                </p>
                <div className="space-y-1.5">
                  {ALL_SET_FLAVORS.map((f) => {
                    const c = SET_FLAVOR_DISPLAY[f];
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
                          {audience === "th" ? c.labelTh : c.label}
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
                    {P.chooseMoreBags[audience]}{setBagCount - flavorTotal}{P.chooseMoreBagsSuffix[audience]}
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
            {!canBuyVip && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 py-2">
                <p className="text-[11px] font-semibold text-amber-900">
                  👑{" "}
                  {language === "en"
                    ? tLang.product.vipPriceLabel
                    : audience === "ja"
                    ? "VIP価格"
                    : "ราคา VIP"}
                  : ฿{vipPriceTeaser.toLocaleString()}
                </p>
                <p className="text-[10px] text-amber-700/90 mt-0.5">
                  {language === "en"
                    ? vipPriceFromData != null
                      ? tLang.product.vipMemberPrice
                      : tLang.product.vipSaving.replace("{pct}", String(vipSavingPct))
                    : vipPriceFromData != null
                    ? audience === "ja"
                      ? "会員限定価格を適用可能"
                      : "สามารถใช้ราคาสมาชิกได้"
                    : audience === "ja"
                    ? `VIPでさらに約${vipSavingPct}%OFF（目安）`
                    : `VIP ลดเพิ่มประมาณ ${vipSavingPct}%`}
                </p>
              </div>
            )}

            {vipLocked && requiredTier !== "normal" && (
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 px-3 py-3 space-y-2">
                <p className="text-[11px] sm:text-xs font-light leading-relaxed tracking-wide text-amber-950/65 text-center">
                  <span className="mr-1" aria-hidden>
                    🔒
                  </span>
                  {requiredTier === "gold" ? V.goldLockLead[audience] : V.silverLockLead[audience]}
                  <span className="block mt-1.5 text-[10px] text-amber-900/50">
                    {V.goldLockYouAre[audience]}
                    <span className="mx-1 font-medium text-amber-900/65">{tierName}</span>
                    {V.goldLockSuffix[audience]}
                  </span>
                </p>
                {!loggedIn && (
                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-[10px] uppercase tracking-[0.2em] text-amber-800/55 hover:text-amber-800 transition-colors border-b border-amber-800/20 hover:border-amber-800/50 pb-0.5"
                    >
                      {V.signInForVip[audience]}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Quantity selector + add to cart */}
            <div className={`flex items-center gap-2 ${vipLocked ? "opacity-45 pointer-events-none" : ""}`}>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                  disabled={qty <= 1 || vipLocked}
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
                  disabled={qty >= 10 || vipLocked}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
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
                {added
                  ? `✓ ${language === "en" ? tLang.product.added : T.added[audience]}`
                  : language === "en"
                  ? tLang.product.addToCart
                  : T.add[audience]}
              </button>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} productName={productNamePrimary} />
      </div>
    </>
  );
}
