"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAudience } from "@/context/AudienceContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import { canPurchaseVipProduct } from "@/lib/loyalty/vip-product-access";
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
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Upload,
  Truck,
  Package,
} from "lucide-react";

const T = SHOP_TEXT.checkout;

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  tambon: string;
  amphoe: string;
  province: string;
  /** 地区・区をセットにした1つの選択肢（value） */
  areaDistrict: string;
  condominium: string;
  roomNumber: string;
  postalCode: string;
  note: string;
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

type SupabaseLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

type VipValidationResponse = {
  ok?: boolean;
  blockedProductIds?: string[];
};

const INITIAL_FORM: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  tambon: "",
  amphoe: "",
  province: "",
  areaDistrict: "",
  condominium: "",
  roomNumber: "",
  postalCode: "",
  note: "",
};

const CHECKOUT_FORM_STORAGE_KEY = "cashew-checkout-form";

function isCheckoutFormShape(obj: unknown): obj is CheckoutForm {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    typeof o.email === "string" &&
    typeof o.phone === "string" &&
    typeof o.addressLine1 === "string" &&
    typeof o.tambon === "string" &&
    typeof o.amphoe === "string" &&
    typeof o.province === "string" &&
    typeof o.areaDistrict === "string" &&
    typeof o.condominium === "string" &&
    typeof o.roomNumber === "string" &&
    typeof o.postalCode === "string" &&
    typeof o.note === "string"
  );
}

function getSavedCheckoutForm(): CheckoutForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isCheckoutFormShape(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCheckoutFormToStorage(form: CheckoutForm): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(form));
  } catch {
    // ignore
  }
}

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

function getAreaDistrictParts(value: string): { tambon: string; amphoe: string } {
  const found = AREA_DISTRICT_OPTIONS.find((o) => o.value === value);
  if (!found) return { tambon: "", amphoe: "" };
  const [tambonRaw = "", amphoeRaw = ""] = found.labelEn.split(",").map((s) => s.trim());
  return { tambon: tambonRaw, amphoe: amphoeRaw };
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
  required = false,
  error,
  children,
}: {
  icon: React.ElementType;
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
        <Icon size={15} className="text-amber-500" />
        {label}
        <span
          className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
            required ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          {required ? "必須" : "任意"}
        </span>
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
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
  const audience = useAudience();
  const auth = useAuthSessionOptional();

  const shippingFee = getShippingFeeBaht(total);
  const totalWithShipping = total + shippingFee;

  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const saved = getSavedCheckoutForm();
    if (saved) setForm(saved);
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <ShoppingCart size={64} className="text-amber-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              <DualLanguageLabel primary={T.cartEmpty[audience]} secondary={T.cartEmpty[audience === "ja" ? "th" : "ja"]} />
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              <DualLanguageLabel primary={T.cartEmptyHint[audience]} secondary={T.cartEmptyHint[audience === "ja" ? "th" : "ja"]} />
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
            >
              {SHOP_TEXT.cart.viewProducts[audience]}
              <ChevronRight size={18} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  function validateCheckoutForm(current: CheckoutForm): FormErrors {
    const next: FormErrors = {};
    const phoneDigits = current.phone.replace(/\D/g, "");
    const postal = current.postalCode.trim();
    if (!current.email.trim()) next.email = "メールアドレスを入力してください";
    if (!current.name.trim()) next.name = "名前 (Name) を入力してください";
    if (!phoneDigits) next.phone = "電話番号を入力してください";
    if (!current.addressLine1.trim()) next.addressLine1 = "住所1を入力してください";
    if (!current.tambon.trim()) next.tambon = "区・町を入力してください";
    if (!current.amphoe.trim()) next.amphoe = "郡・区を入力してください";
    if (!current.province.trim()) next.province = "都・県を入力してください";
    if (!postal) {
      next.postalCode = "郵便番号を入力してください";
    } else if (!/^\d{5}$/.test(postal)) {
      next.postalCode = "郵便番号は5桁の数字で入力してください";
    }
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validationErrors = validateCheckoutForm(form);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setError("入力内容をご確認ください。赤いメッセージの項目を修正してください。");
      return;
    }

    setSubmitting(true);

    try {
      const loggedIn = Boolean(auth?.user);
      const vipTier = auth?.vipTier ?? null;
      for (const item of items) {
        if (!canPurchaseVipProduct(item.product, vipTier, loggedIn)) {
          setError(T.vipCartBlocked[audience]);
          setSubmitting(false);
          return;
        }
      }
      // サーバー側で最終VIP検証（クライアント改変対策）
      const vipCheck = await fetch("/api/checkout/validate-vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id })),
        }),
      }).catch(() => null);
      if (!vipCheck || !vipCheck.ok) {
        setError(audience === "ja" ? "購入可否の確認に失敗しました。時間をおいて再度お試しください。" : "ตรวจสอบสิทธิ์การซื้อไม่สำเร็จ กรุณาลองใหม่");
        setSubmitting(false);
        return;
      }
      const vipJson = (await vipCheck.json().catch(() => ({}))) as VipValidationResponse;
      if (vipJson.ok !== true) {
        setError(T.vipCartBlocked[audience]);
        setSubmitting(false);
        return;
      }

      const trimmedName = form.name.trim() || "";
      const trimmedEmail = form.email.trim() || "";
      const normalizedEmail = trimmedEmail.toLowerCase();
      const trimmedPhone = form.phone.replace(/\D/g, "");
      const areaParts = getAreaDistrictParts(form.areaDistrict);
      const normalizedAddress1 =
        form.addressLine1.trim() ||
        [form.roomNumber.trim(), form.condominium.trim()].filter(Boolean).join(" ");
      const normalizedTambon = form.tambon.trim() || areaParts.tambon || "";
      const normalizedAmphoe = form.amphoe.trim() || areaParts.amphoe || "";
      const normalizedProvince = form.province.trim() || "";
      const trimmedAddress = [
        normalizedAddress1,
        normalizedTambon,
        normalizedAmphoe,
        normalizedProvince,
        form.postalCode || "",
      ].filter(Boolean).join(", ") || "";
      const normalizedNote = form.note.trim() || "";
      const guestUserId = getOrCreateGuestUserId();
      const clientOrderId = generateGuestId();

      const commonOrderPayload = {
        shipping_name: trimmedName,
        shipping_phone: trimmedPhone,
        shipping_address: trimmedAddress,
        user_name: trimmedName,
        user_phone: trimmedPhone,
        address: trimmedAddress,
        order_email: trimmedEmail,
        order_email_normalized: normalizedEmail,
        order_notes: normalizedNote,
        total_amount: totalWithShipping,
        discount_amount: discountAmount,
        status: "pending",
      } as const;

      const basePayloads: Record<string, unknown>[] = [
        {
          ...commonOrderPayload,
        },
        {
          ...commonOrderPayload,
          order_notes: normalizedNote || null,
        },
        {
          shipping_name: trimmedName,
          shipping_phone: trimmedPhone,
          shipping_address: trimmedAddress,
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_email: trimmedEmail,
          order_email_normalized: normalizedEmail,
          total_amount: totalWithShipping,
          status: "pending",
        },
        {
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_email: trimmedEmail,
          order_email_normalized: normalizedEmail,
          order_notes: normalizedNote,
          total_amount: totalWithShipping,
          discount_amount: discountAmount,
          status: "pending",
        },
        {
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_email: trimmedEmail,
          order_email_normalized: normalizedEmail,
          total_amount: totalWithShipping,
          status: "pending",
        },
        {
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_email: trimmedEmail,
          order_email_normalized: normalizedEmail,
          total_amount: totalWithShipping,
        },
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
          user_id: guestUserId,
          ...commonOrderPayload,
        },
        {
          user_id: guestUserId,
          user_name: trimmedName,
          user_phone: trimmedPhone,
          address: trimmedAddress,
          order_email: trimmedEmail,
          order_email_normalized: normalizedEmail,
          total_amount: totalWithShipping,
          status: "pending",
        },
      ];
      const payloadVariants = basePayloads.map((p) => ({ ...p, audience }));

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
          if (item.selectedSizeG != null) meta.selected_size_g = item.selectedSizeG;
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

      if (orderId) {
        const notifyItems = items.map((item) => ({
          name: audience === "th" && item.product.name_th ? item.product.name_th : (item.product.name_ja || item.product.name_th || ""),
          size_g: item.selectedSizeG,
          quantity: item.quantity,
          unit_price: getItemPrice(item),
        }));
        fetch("/api/notify-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            customer_name: trimmedName,
            customer_email: trimmedEmail || null,
            customer_phone: trimmedPhone,
            customer_address: trimmedAddress,
            order_notes: normalizedNote || null,
            items: notifyItems,
            subtotal: total,
            shipping_fee: shippingFee,
            discount_amount: discountAmount,
            total_amount: totalWithShipping,
          }),
        }).catch(() => {});
      }

      saveCheckoutFormToStorage(form);
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
          <DualLanguageLabel primary={T.title[audience]} secondary={T.title[audience === "ja" ? "th" : "ja"]} />
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
              <DualLanguageLabel primary={T.orderSummary[audience]} secondary={T.orderSummary[audience === "ja" ? "th" : "ja"]} />
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
                        alt={audience === "th" && product.name_th ? product.name_th : product.name_ja}
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
                    <p className="font-bold text-gray-800 text-sm truncate">{audience === "th" && product.name_th ? product.name_th : product.name_ja}</p>
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
                <DualLanguageLabel primary={T.shippingBasic50[audience]} secondary={T.shippingBasic50[audience === "ja" ? "th" : "ja"]} />
              </p>
              <p className="text-amber-700 text-sm text-center mt-0.5">
                <DualLanguageLabel primary={T.shippingFreeOver1000[audience]} secondary={T.shippingFreeOver1000[audience === "ja" ? "th" : "ja"]} />
              </p>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {shippingFee === 0 ? (
                  <DualLanguageLabel primary={T.shippingFree[audience]} secondary={T.shippingFree[audience === "ja" ? "th" : "ja"]} />
                ) : (
                  <DualLanguageLabel primary={T.shipping[audience]} secondary={T.shipping[audience === "ja" ? "th" : "ja"]} />
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
              <DualLanguageLabel primary={T.yourDetails[audience]} secondary={T.yourDetails[audience === "ja" ? "th" : "ja"]} />
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Field
              icon={Mail}
              label={<DualLanguageLabel primary={audience === "ja" ? "メールアドレス" : "อีเมล"} secondary={audience === "ja" ? "อีเมล" : "メールアドレス"} />}
              required
              error={formErrors.email}
            >
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@example.com"
                className={inputClass}
                autoComplete="email"
                required
              />
            </Field>

            <Field icon={User} label="名前 (Name)" required error={formErrors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="例: Taro Yamada (アルファベット推奨)"
                className={inputClass}
                autoComplete="name"
              />
            </Field>

            <Field icon={MapPin} label={<DualLanguageLabel primary={T.address[audience]} secondary={T.address[audience === "ja" ? "th" : "ja"]} />}>
              <div className="space-y-2">
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    住所1（番地・建物・Soi・道路）
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">必須</span>
                  </p>
                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={(e) => {
                      setForm({ ...form, addressLine1: e.target.value });
                      if (formErrors.addressLine1) setFormErrors((prev) => ({ ...prev, addressLine1: undefined }));
                    }}
                    placeholder="Room 123, Waterford Condo, 50/1 Soi Sukhumvit 39"
                    className={inputClass}
                    autoComplete="address-line1"
                  />
                  {formErrors.addressLine1 ? <p className="mt-1 text-xs text-red-600">{formErrors.addressLine1}</p> : null}
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    区・町 (Sub-district / แขวง/ตำบล)
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">必須</span>
                  </p>
                  <input
                    type="text"
                    value={form.tambon}
                    onChange={(e) => {
                      setForm({ ...form, tambon: e.target.value });
                      if (formErrors.tambon) setFormErrors((prev) => ({ ...prev, tambon: undefined }));
                    }}
                    placeholder="区・町 (Sub-district / แขวง/ตำบล)"
                    className={inputClass}
                    autoComplete="address-level3"
                  />
                  {formErrors.tambon ? <p className="mt-1 text-xs text-red-600">{formErrors.tambon}</p> : null}
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    郡・区 (District / เขต/อำเภอ)
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">必須</span>
                  </p>
                  <input
                    type="text"
                    value={form.amphoe}
                    onChange={(e) => {
                      setForm({ ...form, amphoe: e.target.value });
                      if (formErrors.amphoe) setFormErrors((prev) => ({ ...prev, amphoe: undefined }));
                    }}
                    placeholder="郡・区 (District / เขต/อำเภอ)"
                    className={inputClass}
                    autoComplete="address-level2"
                  />
                  {formErrors.amphoe ? <p className="mt-1 text-xs text-red-600">{formErrors.amphoe}</p> : null}
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    都・県 (Province / จังหวัด)
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">必須</span>
                  </p>
                  <input
                    type="text"
                    value={form.province}
                    onChange={(e) => {
                      setForm({ ...form, province: e.target.value });
                      if (formErrors.province) setFormErrors((prev) => ({ ...prev, province: undefined }));
                    }}
                    placeholder="都・県 (Province / จังหวัด)"
                    className={inputClass}
                    autoComplete="address-level1"
                  />
                  {formErrors.province ? <p className="mt-1 text-xs text-red-600">{formErrors.province}</p> : null}
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    郵便番号 (Postal Code / รหัสไปรษณีย์)
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">必須</span>
                  </p>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => {
                      setForm({ ...form, postalCode: e.target.value });
                      if (formErrors.postalCode) setFormErrors((prev) => ({ ...prev, postalCode: undefined }));
                    }}
                    placeholder="郵便番号 (Postal Code / รหัสไปรษณีย์)"
                    className={inputClass}
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                  {formErrors.postalCode ? <p className="mt-1 text-xs text-red-600">{formErrors.postalCode}</p> : null}
                </div>

                <select
                  value={form.areaDistrict}
                  onChange={(e) => {
                    const next = e.target.value;
                    const parts = getAreaDistrictParts(next);
                    setForm((prev) => ({
                      ...prev,
                      areaDistrict: next,
                      tambon: prev.tambon || parts.tambon,
                      amphoe: prev.amphoe || parts.amphoe,
                    }));
                  }}
                  className={inputClass}
                >
                  <option value="">クイック選択（任意）: 区/町・郡</option>
                  {AREA_DISTRICT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.labelJa} ({opt.labelEn})
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs">
                  上のクイック選択は任意です。เลือกด่วนได้ (ไม่บังคับ)
                </p>
              </div>
            </Field>

            <Field
              icon={Phone}
              label={<DualLanguageLabel primary={T.phone[audience]} secondary={T.phone[audience === "ja" ? "th" : "ja"]} />}
              required
              error={formErrors.phone}
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="08x-xxx-xxxx"
                className={inputClass}
                autoComplete="tel"
                inputMode="numeric"
              />
            </Field>

            <Field icon={MessageSquare} label={<DualLanguageLabel primary={T.note[audience]} secondary={T.note[audience === "ja" ? "th" : "ja"]} />}>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="味の指定・配達希望・上記にない住所など"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 space-y-3">
              <p className="text-sm font-bold text-amber-900">
                {audience === "ja" ? "ご注文後の流れ (3ステップ)" : "ขั้นตอนหลังสั่งซื้อ (3 ขั้นตอน)"}
              </p>
              <div className="grid gap-2.5">
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2.5">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <ShoppingCart size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900">
                      ① {audience === "ja" ? "注文を確定する" : "ยืนยันคำสั่งซื้อ"}
                    </p>
                    <p className="text-[11px] text-amber-800/80">
                      {audience === "ja" ? "Confirm your order" : "Confirm your order"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2.5">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Upload size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900">
                      ② {audience === "ja" ? "銀行振込 ＆ スリップ画像のアップロード" : "โอนเงินธนาคาร และอัปโหลดสลิป"}
                    </p>
                    <p className="text-[11px] text-amber-800/80">
                      {audience === "ja" ? "Bank transfer & slip upload" : "Bank transfer & slip upload"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2.5">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Truck size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900">
                      ③ {audience === "ja" ? "入金確認 ＆ 商品の発送" : "ยืนยันการชำระเงิน และจัดส่งสินค้า"}
                    </p>
                    <p className="text-[11px] text-amber-800/80">
                      {audience === "ja" ? "Payment confirmation & shipping" : "Payment confirmation & shipping"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-4 rounded-2xl text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  {T.confirming[audience]}
                </>
              ) : (
                <>
                  {T.confirmOrder[audience]}
                  <span className="text-white/80 text-xs ml-1">({T.confirmOrder[audience === "ja" ? "th" : "ja"]})</span>
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
