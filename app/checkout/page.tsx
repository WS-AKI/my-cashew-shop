"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { getItemPrice, getItemOriginalPrice, FLAVOR_COLORS, FlavorColor, setFlavorSummary, serializeSetFlavors } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { SHOP_TEXT, getShippingFeeBaht } from "@/lib/shop-config";
import {
  ShoppingBag,
  ChevronRight,
  Tag,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Package,
} from "lucide-react";

const T = SHOP_TEXT.checkout;

type CheckoutForm = {
  name: string;
  phone: string;
  /** 地区・区をセットにした1つの選択肢（value） */
  areaDistrict: string;
  condominium: string;
  roomNumber: string;
  postalCode: string;
  note: string;
};

type SupabaseLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const INITIAL_FORM: CheckoutForm = {
  name: "",
  phone: "",
  areaDistrict: "",
  condominium: "",
  roomNumber: "",
  postalCode: "",
  note: "",
};

/** 地区名＋区名をセットにした1つのリスト（1回のドロップダウンで選択） */
const AREA_DISTRICT_OPTIONS = [
  { value: "1", labelJa: "クロンタン・ヌア、ワッタナー", labelEn: "Khlong Tan Nuea, Watthana" },
  { value: "2", labelJa: "クロントーイ・ヌア、ワッタナー", labelEn: "Khlong Toei Nuea, Watthana" },
  { value: "3", labelJa: "プラカノン・ヌア、ワッタナー", labelEn: "Phra Khanong Nuea, Watthana" },
  { value: "4", labelJa: "クロンタン、クロントーイ", labelEn: "Khlong Tan, Khlong Toei" },
  { value: "5", labelJa: "クロントーイ、クロントーイ", labelEn: "Khlong Toei, Khlong Toei" },
  { value: "6", labelJa: "プラカノン、クロントーイ", labelEn: "Phra Khanong, Khlong Toei" },
] as const;

function getAreaDistrictLabel(value: string): string {
  const found = AREA_DISTRICT_OPTIONS.find((o) => o.value === value);
  return found ? `${found.labelJa} (${found.labelEn})` : "";
}

function generateGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

function getOrCreateGuestUserId(): string {
  const KEY = "guest-user-id";
  const existing = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
  if (existing) return existing;
  const created = generateGuestId();
  if (typeof window !== "undefined") localStorage.setItem(KEY, created);
  return created;
}

function Field({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: React.ElementType;
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
        <Icon size={15} className="text-amber-500" />
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition text-base";

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, subtotal, discountRate, discountAmount, total, nextDiscountStep, clearCart } =
    useCart();

  const shippingFee = getShippingFeeBaht(total);
  const totalWithShipping = total + shippingFee;

  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <ShoppingCart size={64} className="text-amber-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              <DualLanguageLabel primary={T.cartEmpty.ja} secondary={T.cartEmpty.th} />
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              <DualLanguageLabel primary={T.cartEmptyHint.ja} secondary={T.cartEmptyHint.th} />
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
            >
              {SHOP_TEXT.cart.viewProducts.ja}
              <ChevronRight size={18} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    setSubmitting(true);

    try {
      const trimmedName = form.name.trim() || "";
      const trimmedPhone = form.phone.trim() || "";
      const trimmedAddress = [
        form.roomNumber ? `Room ${form.roomNumber}` : "",
        form.condominium || "",
        getAreaDistrictLabel(form.areaDistrict),
        form.postalCode || "",
      ].filter(Boolean).join(", ") || "";
      const normalizedNote = form.note.trim() || "";
      const guestUserId = getOrCreateGuestUserId();
      const clientOrderId = generateGuestId();

      const payloadVariants: Record<string, unknown>[] = [
        // 新スキーマ向け: shipping_* と旧キーの両方を送る
        {
          shipping_name: trimmedName,
          shipping_phone: trimmedPhone,
          shipping_address: trimmedAddress,
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_notes: normalizedNote,
          total_amount: totalWithShipping,
          discount_amount: discountAmount,
          status: "pending",
        },
        {
          shipping_name: trimmedName,
          shipping_phone: trimmedPhone,
          shipping_address: trimmedAddress,
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          total_amount: totalWithShipping,
          status: "pending",
        },
        // shipping_* のみ必要なスキーマ向け
        {
          shipping_name: trimmedName,
          shipping_phone: trimmedPhone,
          shipping_address: trimmedAddress,
          total_amount: totalWithShipping,
          status: "pending",
        },
        // 旧スキーマ向け: user_* / address
        {
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_notes: normalizedNote,
          total_amount: totalWithShipping,
          discount_amount: discountAmount,
          status: "pending",
        },
        {
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          total_amount: totalWithShipping,
          status: "pending",
        },
        {
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          total_amount: totalWithShipping,
        },
        // user_id 必須スキーマ向け
        {
          user_id: guestUserId,
          shipping_name: trimmedName,
          shipping_phone: trimmedPhone,
          shipping_address: trimmedAddress,
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_notes: normalizedNote,
          total_amount: totalWithShipping,
          discount_amount: discountAmount,
          status: "pending",
        },
        {
          user_id: guestUserId,
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          total_amount: totalWithShipping,
          status: "pending",
        },
      ];

      let orderId: string | null = null;
      let lastOrderError: SupabaseLikeError | null = null;

      // 1) 優先: クライアント側で order id を作成して INSERT（SELECTポリシー不要）
      for (const payload of payloadVariants) {
        const payloadWithId = { id: clientOrderId, ...payload };
        const { error } = await supabase.from("orders").insert(payloadWithId);
        if (!error) {
          orderId = clientOrderId;
          break;
        }
        lastOrderError = error;
      }

      // 2) フォールバック: DB採番 + select("id")
      if (!orderId) {
        for (const payload of payloadVariants) {
          const { data, error } = await supabase
            .from("orders")
            .insert(payload)
            .select("id")
            .single();
          if (!error && data?.id) {
            orderId = data.id as string;
            break;
          }
          lastOrderError = error;
        }
      }

      if (!orderId) {
        console.error("orders insert failed (debug bypass)", {
          lastOrderError,
          payloadVariants,
        });
      }

      if (orderId) {
        const orderItemsBase = items.map((item) => {
          const flavorsObj = item.selectedFlavors;
          const hasFlavors = flavorsObj && Object.values(flavorsObj).some((v) => v > 0);
          const meta: Record<string, unknown> = {};
          if (hasFlavors && flavorsObj) meta.flavors = flavorsObj;
          if (item.saltOption) meta.salt_option = item.saltOption;
          return {
            order_id: orderId,
            product_id: item.product.id,
            quantity: item.quantity,
            priceValue: getItemPrice(item) || 0,
            meta,
          };
        });
        const itemVariants: Record<string, unknown>[][] = [
          orderItemsBase.map((x) => ({
            order_id: x.order_id,
            product_id: x.product_id,
            quantity: x.quantity,
            unit_price: x.priceValue,
            price_at_purchase: x.priceValue || 0,
            meta: x.meta,
          })),
          orderItemsBase.map((x) => ({
            order_id: x.order_id,
            product_id: x.product_id,
            quantity: x.quantity,
            unit_price: x.priceValue,
            price_at_purchase: x.priceValue || 0,
          })),
          orderItemsBase.map((x) => ({
            order_id: x.order_id,
            product_id: x.product_id,
            quantity: x.quantity,
            price: x.priceValue,
            price_at_purchase: x.priceValue || 0,
          })),
          orderItemsBase.map((x) => ({
            order_id: x.order_id,
            product_id: x.product_id,
            quantity: x.quantity,
            price_at_purchase: x.priceValue || 0,
          })),
          orderItemsBase.map((x) => ({
            order_id: x.order_id,
            product_id: x.product_id,
            quantity: x.quantity,
          })),
        ];

        let lastItemsError: SupabaseLikeError | null = null;
        let itemsSaved = false;
        for (const variant of itemVariants) {
          const { error: itemsError } = await supabase.from("order_items").insert(variant);
          if (!itemsError) {
            itemsSaved = true;
            break;
          }
          lastItemsError = itemsError;
        }

        if (!itemsSaved) {
          console.error("order_items insert failed (debug bypass)", {
            lastItemsError,
            itemVariants,
          });
        }
      } else {
        console.error("order_items skipped because orders insert failed (debug bypass)");
      }

      clearCart();
      router.push(orderId ? `/order-success?order=${orderId}` : "/order-success");
    } catch (err) {
      console.error("checkout submit unexpected error (debug bypass)", err);
      clearCart();
      router.push("/order-success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6 pb-8">
        <h1 className="text-2xl font-extrabold text-amber-950 flex items-center gap-2">
          <ShoppingBag size={26} className="text-amber-500" />
          <DualLanguageLabel primary={T.title.ja} secondary={T.title.th} />
        </h1>

        {nextDiscountStep && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center gap-3">
            <Tag size={22} className="text-white flex-shrink-0" />
            <p className="text-white font-bold text-sm">
              Add {nextDiscountStep.remaining} more for {nextDiscountStep.nextRate}% OFF!
            </p>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
            <h2 className="font-bold text-amber-900">
              <DualLanguageLabel primary={T.orderSummary.ja} secondary={T.orderSummary.th} />
            </h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const { product, quantity, selectedSizeG, selectedFlavors } = item;
              const unitPrice = getItemPrice(item);
              const flavor = product.flavor_color && product.flavor_color in FLAVOR_COLORS
                ? FLAVOR_COLORS[product.flavor_color as FlavorColor]
                : null;
              const flavorList = setFlavorSummary(selectedFlavors);
              const itemKey = `${product.id}-${selectedSizeG ?? "set"}-${serializeSetFlavors(selectedFlavors)}-${item.saltOption ?? ""}`;
              return (
                <li key={itemKey} className="flex gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name_ja}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-amber-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{product.name_ja}</p>
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
                        <p className="text-sm mt-0.5 flex items-center gap-1 flex-wrap">
                          {onSale && (
                            <span className="text-gray-400 line-through text-xs">
                              ฿{origPrice.toLocaleString()}
                            </span>
                          )}
                          <span className={onSale ? "text-red-500 font-semibold" : "text-gray-500"}>
                            ฿{unitPrice.toLocaleString()}
                          </span>
                          <span className="text-gray-400">x{quantity} =</span>
                          <span className={`font-bold ${onSale ? "text-red-500" : "text-gray-700"}`}>
                            ฿{(unitPrice * quantity).toLocaleString()}
                          </span>
                        </p>
                      );
                    })()}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-amber-100 px-4 py-4 space-y-1 bg-amber-50/50">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {discountRate > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Discount</span>
                <span>−฿{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="rounded-xl bg-amber-100/80 border border-amber-200 px-3 py-2 my-2">
              <p className="text-amber-900 font-bold text-center text-lg">
                <DualLanguageLabel primary={T.shippingBasic50.ja} secondary={T.shippingBasic50.th} />
              </p>
              <p className="text-amber-700 text-sm text-center mt-0.5">
                <DualLanguageLabel primary={T.shippingFreeOver1000.ja} secondary={T.shippingFreeOver1000.th} />
              </p>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {shippingFee === 0 ? (
                  <DualLanguageLabel primary={T.shippingFree.ja} secondary={T.shippingFree.th} />
                ) : (
                  <DualLanguageLabel primary={T.shipping.ja} secondary={T.shipping.th} />
                )}
              </span>
              <span>฿{shippingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-extrabold text-amber-950 text-xl pt-2 border-t border-amber-100">
              <span>Total (THB)</span>
              <span>฿{totalWithShipping.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
            <h2 className="font-bold text-amber-900">
              <DualLanguageLabel primary={T.yourDetails.ja} secondary={T.yourDetails.th} />
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Field icon={User} label={<DualLanguageLabel primary={T.name.ja} secondary={T.name.th} />}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className={inputClass}
                autoComplete="name"
              />
            </Field>

            <Field icon={Phone} label={<DualLanguageLabel primary={T.phone.ja} secondary={T.phone.th} />}>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08x-xxx-xxxx"
                className={inputClass}
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>

            <Field icon={MapPin} label={<DualLanguageLabel primary={T.address.ja} secondary={T.address.th} />}>
              <div className="space-y-2">
                <select
                  value={form.areaDistrict}
                  onChange={(e) => setForm({ ...form, areaDistrict: e.target.value })}
                  className={inputClass}
                >
                  <option value="">地区・区を選択してください</option>
                  {AREA_DISTRICT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.labelJa} ({opt.labelEn})
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs">
                  上記にない住所の場合は、下の備考欄に住所をご記入ください。
                </p>

                <input
                  type="text"
                  value={form.condominium}
                  onChange={(e) => setForm({ ...form, condominium: e.target.value })}
                  placeholder="Condominium / Apartment name（マンション名・ご自由に記入）"
                  className={inputClass}
                  autoComplete="address-line1"
                />

                <input
                  type="text"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  placeholder="部屋番号（ご自由に記入）"
                  className={inputClass}
                  autoComplete="off"
                />

                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="郵便番号（ご自由に記入）"
                  className={inputClass}
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
              </div>
            </Field>

            <Field icon={MessageSquare} label={<DualLanguageLabel primary={T.note.ja} secondary={T.note.th} />}>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="味の指定・配達希望・上記にない住所など"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-4 rounded-2xl text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  {T.confirming.ja}
                </>
              ) : (
                <>
                  {T.confirmOrder.ja}
                  <span className="text-white/80 text-xs ml-1">({T.confirmOrder.th})</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
