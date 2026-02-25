export type FlavorColor = "original" | "cheese" | "bbq" | "nori" | "tomyum";

export const FLAVOR_COLORS: Record<
  FlavorColor,
  {
    label: string;
    labelTh: string;
    hex: string;
    bg: string;
    text: string;
    border: string;
    cardBorder: string;
    cardBg: string;
  }
> = {
  original: {
    label: "オリジナル",
    labelTh: "รสดั้งเดิม",
    hex: "#22C55E",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-400",
    cardBorder: "border-green-200",
    cardBg: "bg-green-50/30",
  },
  cheese: {
    label: "チーズ味",
    labelTh: "รสชีส",
    hex: "#EAB308",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-400",
    cardBorder: "border-yellow-200",
    cardBg: "bg-yellow-50/30",
  },
  bbq: {
    label: "バーベキュー味",
    labelTh: "รสบาร์บีคิว",
    hex: "#EF4444",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-400",
    cardBorder: "border-red-200",
    cardBg: "bg-red-50/30",
  },
  nori: {
    label: "のり味",
    labelTh: "รสสาหร่าย",
    hex: "#059669",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-400",
    cardBorder: "border-emerald-200",
    cardBg: "bg-emerald-50/30",
  },
  tomyum: {
    label: "トムヤム味",
    labelTh: "รสต้มยำ",
    hex: "#F97316",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-400",
    cardBorder: "border-orange-200",
    cardBg: "bg-orange-50/30",
  },
};

export type PriceVariant = {
  size_g: number;
  price: number;
  sale_price?: number;
  image_url?: string;
  /** 売上ページで入力するタイ人向け価格（比較用）。未入力は null。 */
  thai_price?: number | null;
};

export type Product = {
  id: string;
  name_ja: string;
  name_th: string | null;
  description_ja: string | null;
  description_th: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  gallery_urls: string[];
  stock: number;
  is_active: boolean;
  is_promotion: boolean;
  display_order: number;
  flavor_color: FlavorColor | null;
  weight_g: number | null;
  is_set: boolean;
  set_quantity: number | null;
  thai_price?: number | null;
  price_variants: PriceVariant[];
  created_at: string;
};

export type FlavorSelection = Record<FlavorColor, number>;

/** セット用: オリジナルを塩あり/塩なしで分離した6種類 */
export type SetFlavorKey = "original_salt" | "original_nosalt" | "cheese" | "bbq" | "nori" | "tomyum";
export type SetFlavorSelection = Record<SetFlavorKey, number>;

/** セット用フレーバーの表示ラベル・色（original の色を original_salt / original_nosalt で流用） */
export const SET_FLAVOR_DISPLAY: Record<SetFlavorKey, { label: string; labelTh: string; hex: string; bg: string; text: string }> = {
  original_salt: { ...FLAVOR_COLORS.original, label: "オリジナル（塩あり）", labelTh: "รสดั้งเดิม (มีเกลือ)" },
  original_nosalt: { ...FLAVOR_COLORS.original, label: "オリジナル（塩なし）", labelTh: "รสดั้งเดิม (ไม่มีเกลือ)" },
  cheese: FLAVOR_COLORS.cheese,
  bbq: FLAVOR_COLORS.bbq,
  nori: FLAVOR_COLORS.nori,
  tomyum: FLAVOR_COLORS.tomyum,
};

export type SaltOption = "with_salt" | "no_salt";

export type CartItem = {
  product: Product;
  quantity: number;
  selectedSizeG: number | null;
  /** セット時は SetFlavorSelection。単品は null。 */
  selectedFlavors: SetFlavorSelection | null;
  /** 単品オリジナル時のみ: 塩あり/塩なし */
  saltOption?: SaltOption | null;
};

export function serializeFlavors(flavors: FlavorSelection | null): string {
  if (!flavors) return "";
  return Object.entries(flavors)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
}

/** セット用フレーバーをキー文字列に（cartItemKey 用） */
export function serializeSetFlavors(flavors: SetFlavorSelection | null): string {
  if (!flavors) return "";
  return (Object.entries(flavors) as [SetFlavorKey, number][])
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
}

export function flavorSummary(flavors: FlavorSelection | null): string[] {
  if (!flavors) return [];
  return (Object.entries(flavors) as [FlavorColor, number][])
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${FLAVOR_COLORS[key].label} x${count}`);
}

/** セット用フレーバー表示（オリジナル塩あり/なし含む） */
export function setFlavorSummary(flavors: SetFlavorSelection | null): string[] {
  if (!flavors) return [];
  return (Object.entries(flavors) as [SetFlavorKey, number][])
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${SET_FLAVOR_DISPLAY[key].label} x${count}`);
}

export function getVariantForSize(
  product: Product,
  sizeG: number | null
): PriceVariant | null {
  if (!sizeG || !product.price_variants?.length) return null;
  return product.price_variants.find((v) => v.size_g === sizeG) ?? null;
}

export function getItemPrice(item: CartItem): number {
  const variant = getVariantForSize(item.product, item.selectedSizeG);
  if (variant) return variant.sale_price ?? variant.price;
  return item.product.sale_price ?? item.product.price;
}

export function getItemOriginalPrice(item: CartItem): number {
  const variant = getVariantForSize(item.product, item.selectedSizeG);
  if (variant) return variant.price;
  return item.product.price;
}

export type ProductReview = {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id?: string | null;
  user_name: string;
  user_phone: string;
  address: string;
  order_notes: string | null;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
  slip_image_url?: string | null;
};

export type OrderItem = {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number | null;
  price?: number | null;
};
