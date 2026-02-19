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
};

export type Product = {
  id: string;
  name_ja: string;
  name_th: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  is_promotion: boolean;
  display_order: number;
  flavor_color: FlavorColor | null;
  weight_g: number | null;
  is_set: boolean;
  price_variants: PriceVariant[];
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  selectedSizeG: number | null;
};

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
