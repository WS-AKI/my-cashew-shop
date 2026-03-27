/**
 * オーディエンス別の商品取得。価格の厳格な分離を保証する。
 * - 日本向け(ja): price, sale_price のみ取得。thai_price は select せず、price_variants からも thai_price を除外。
 * - タイ向け(th): thai_price のみ取得。price, sale_price は select せず、表示用に price にマッピングする。
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAnonClient } from "@/lib/supabase/anon-client";
import type { Product, PriceVariant, VipRequiredTier } from "@/types";
import type { Audience } from "@/lib/audience";

/** 日本向け: タイ向け価格を一切取得しない */
const JA_PRODUCT_COLUMNS =
  "id, name_ja, name_th, description_ja, description_th, price, sale_price, image_url, gallery_urls, stock, is_active, is_promotion, display_order, flavor_color, weight_g, is_set, set_quantity, price_variants, created_at, vip_required_tier, is_gold_exclusive";

/** タイ向け: 日本向け価格(price, sale_price)を一切取得しない。thai_price を price として使うため select のみ */
const TH_PRODUCT_COLUMNS =
  "id, name_ja, name_th, description_ja, description_th, thai_price, image_url, gallery_urls, stock, is_active, is_promotion, display_order, flavor_color, weight_g, is_set, set_quantity, price_variants, created_at, vip_required_tier, is_gold_exclusive";

type JaRow = {
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
  flavor_color: string | null;
  weight_g: number | null;
  is_set: boolean;
  set_quantity: number | null;
  price_variants: (Omit<PriceVariant, "thai_price">)[];
  created_at: string;
  vip_required_tier?: string | null;
  is_gold_exclusive?: boolean | null;
};

type ThVariantRaw = { size_g: number; thai_price?: number | null; image_url?: string };
type ThRow = {
  id: string;
  name_ja: string;
  name_th: string | null;
  description_ja: string | null;
  description_th: string | null;
  thai_price: number | null;
  image_url: string | null;
  gallery_urls: string[];
  stock: number;
  is_active: boolean;
  is_promotion: boolean;
  display_order: number;
  flavor_color: string | null;
  weight_g: number | null;
  is_set: boolean;
  set_quantity: number | null;
  price_variants: ThVariantRaw[];
  created_at: string;
  vip_required_tier?: string | null;
  is_gold_exclusive?: boolean | null;
};

function normalizeVipProductFields(row: {
  vip_required_tier?: string | null;
  is_gold_exclusive?: boolean | null;
}): Pick<Product, "vip_required_tier" | "is_gold_exclusive"> {
  let tier: VipRequiredTier = "normal";
  const v = row.vip_required_tier;
  if (v === "normal" || v === "silver" || v === "gold") tier = v;
  else if (row.is_gold_exclusive) tier = "gold";
  return {
    vip_required_tier: tier,
    is_gold_exclusive: tier === "gold",
  };
}

/** price_variants から thai_price を除去して返す（日本向け用） */
function stripThaiPriceFromVariants(
  variants: unknown
): Omit<PriceVariant, "thai_price">[] {
  if (!Array.isArray(variants)) return [];
  return variants.map((v: Record<string, unknown>) => {
    const { thai_price: _, ...rest } = v;
    return rest as Omit<PriceVariant, "thai_price">;
  });
}

/** タイ向けの DB 行を Product 型に変換（thai_price → price、sale_price は null） */
function thRowToProduct(row: ThRow): Product {
  const basePrice = row.thai_price ?? 0;
  const priceVariants: PriceVariant[] = [];
  if (Array.isArray(row.price_variants)) {
    for (const v of row.price_variants) {
      const thai = v.thai_price ?? basePrice;
      priceVariants.push({
        size_g: v.size_g,
        price: thai,
        sale_price: undefined,
        image_url: v.image_url,
      });
    }
  }
  return {
    id: row.id,
    name_ja: row.name_ja,
    name_th: row.name_th,
    description_ja: row.description_ja,
    description_th: row.description_th,
    price: basePrice,
    sale_price: null,
    image_url: row.image_url,
    gallery_urls: row.gallery_urls ?? [],
    stock: row.stock,
    is_active: row.is_active,
    is_promotion: row.is_promotion,
    display_order: row.display_order,
    flavor_color: row.flavor_color as Product["flavor_color"],
    weight_g: row.weight_g,
    is_set: row.is_set,
    set_quantity: row.set_quantity,
    price_variants: priceVariants,
    created_at: row.created_at,
    ...normalizeVipProductFields(row),
  };
}

/** 既存の Supabase クライアントで商品取得（ホーム等で announcements と並列に使う） */
export async function fetchProductsForAudienceWithClient(
  supabase: SupabaseClient,
  audience: Audience,
): Promise<Product[]> {
  if (audience === "ja") {
    const { data, error } = await supabase
      .from("products")
      .select(JA_PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as JaRow[];
    return rows.map((row) => ({
      ...row,
      price_variants: stripThaiPriceFromVariants(row.price_variants),
      ...normalizeVipProductFields(row),
    })) as Product[];
  }
  const { data, error } = await supabase
    .from("products")
    .select(TH_PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as ThRow[];
  return rows.map(thRowToProduct);
}

/** 日本向け商品一覧。thai_price は一切取得・含めない */
export async function fetchProductsForJa(): Promise<Product[]> {
  const supabase = await createClient();
  return fetchProductsForAudienceWithClient(supabase, "ja");
}

/** タイ向け商品一覧。price/sale_price は取得せず、thai_price を price にマッピング */
export async function fetchProductsForTh(): Promise<Product[]> {
  const supabase = await createClient();
  return fetchProductsForAudienceWithClient(supabase, "th");
}

export async function fetchProductsForAudience(audience: Audience): Promise<Product[]> {
  const supabase = await createClient();
  return fetchProductsForAudienceWithClient(supabase, audience);
}

/**
 * Cookie・セッション不要の公開取得バージョン。
 * ISR（revalidate）ページや静的生成ページで使用する。
 * anon の SELECT ポリシーが products に設定されていれば動作する。
 */
export async function fetchProductsPublicForAudience(audience: Audience): Promise<Product[]> {
  const supabase = getSupabaseAnonClient();
  return fetchProductsForAudienceWithClient(supabase, audience);
}
