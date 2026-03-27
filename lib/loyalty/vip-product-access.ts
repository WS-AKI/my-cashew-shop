import type { Product, VipRequiredTier } from "@/types";
import type { VipTier } from "@/lib/loyalty/sync-loyalty-profile";

const TIER_RANK: Record<VipRequiredTier, number> = {
  normal: 0,
  silver: 1,
  gold: 2,
};

function isVipRequiredTier(v: unknown): v is VipRequiredTier {
  return v === "normal" || v === "silver" || v === "gold";
}

/**
 * DB の vip_required_tier を優先。未移行行は is_gold_exclusive で gold とみなす。
 */
export function getProductVipRequiredTier(
  product: Pick<Product, "vip_required_tier" | "is_gold_exclusive">,
): VipRequiredTier {
  if (isVipRequiredTier(product.vip_required_tier)) {
    return product.vip_required_tier;
  }
  if (product.is_gold_exclusive) return "gold";
  return "normal";
}

export function isVipGatedProduct(product: Pick<Product, "vip_required_tier" | "is_gold_exclusive">): boolean {
  return getProductVipRequiredTier(product) !== "normal";
}

/**
 * 会員ランクが商品の最低要件を満たすか。未ログインは normal のみ購入可。
 */
export function canPurchaseVipProduct(
  product: Pick<Product, "vip_required_tier" | "is_gold_exclusive">,
  vipTier: VipTier | null,
  isLoggedIn: boolean,
): boolean {
  const required = getProductVipRequiredTier(product);
  if (required === "normal") return true;
  if (!isLoggedIn || !vipTier) return false;
  return TIER_RANK[vipTier] >= TIER_RANK[required];
}

/** @deprecated use canPurchaseVipProduct */
export function canPurchaseGoldExclusiveProduct(
  product: Pick<Product, "vip_required_tier" | "is_gold_exclusive">,
  vipTier: VipTier | null,
  isLoggedIn: boolean,
): boolean {
  return canPurchaseVipProduct(product, vipTier, isLoggedIn);
}
