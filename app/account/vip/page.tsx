"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Crown, Lock, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAudience } from "@/context/AudienceContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import { canPurchaseVipProduct, getProductVipRequiredTier } from "@/lib/loyalty/vip-product-access";

type Tier = "normal" | "silver" | "gold";

const COPY = {
  ja: {
    title: "VIPルーム",
    subtitle: "限定特典と会員限定プロダクト",
    silverRoom: "Silver Selection",
    goldRoom: "Gold Collection",
    locked: "ロック中",
    addToCart: "カートに追加",
    unlockSoon: "あと {amount} THB でアンロック",
    toProducts: "商品一覧へ",
    signIn: "会員ログイン",
    emptySilver: "現在、Silver 以上限定の商品はありません。",
    emptyGold: "現在、Gold 限定の商品はありません。",
  },
  th: {
    title: "ห้อง VIP",
    subtitle: "สิทธิพิเศษและสินค้าสำหรับสมาชิก",
    silverRoom: "Silver Selection",
    goldRoom: "Gold Collection",
    locked: "ยังล็อกอยู่",
    addToCart: "เพิ่มลงตะกร้า",
    unlockSoon: "อีก {amount} THB เพื่อปลดล็อก",
    toProducts: "ไปหน้าสินค้า",
    signIn: "เข้าสู่ระบบสมาชิก",
    emptySilver: "ขณะนี้ยังไม่มีสินค้าสำหรับ Silver ขึ้นไป",
    emptyGold: "ขณะนี้ยังไม่มีสินค้าเฉพาะ Gold",
  },
} as const;

type ThresholdRow = {
  silver_lifetime_thb: number;
  gold_lifetime_thb: number;
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-200/90 via-amber-300/80 to-amber-500/70 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function ProductCard({
  product,
  locked,
  dark,
  frame,
  unlockHint,
  addLabel,
  onAdd,
}: {
  product: Product;
  locked: boolean;
  dark: boolean;
  frame: "none" | "silver" | "gold";
  unlockHint?: string;
  addLabel: string;
  onAdd: () => void;
}) {
  const frameClass =
    frame === "gold"
      ? "border-amber-300/70 shadow-[0_0_0_1px_rgba(217,166,63,0.35),0_16px_40px_-28px_rgba(217,166,63,0.55)]"
      : frame === "silver"
        ? "border-slate-300/80 shadow-[0_0_0_1px_rgba(192,199,209,0.45),0_16px_34px_-28px_rgba(94,109,128,0.55)]"
        : "border-amber-200/50";

  return (
    <article className={`relative overflow-hidden rounded-3xl border ${frameClass} ${dark ? "bg-[#1a1b1f]" : "bg-white/80"}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name_ja} className={`h-full w-full object-cover ${locked ? "scale-105" : ""}`} />
        ) : (
          <div className={`h-full w-full ${dark ? "bg-zinc-800" : "bg-amber-100"}`} />
        )}
        {locked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 backdrop-blur-md">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-xs text-white">
              <Lock className="h-3.5 w-3.5" />
              {unlockHint}
            </span>
          </div>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <p className={`text-sm font-medium ${dark ? "text-zinc-100" : "text-amber-950"}`}>
          {product.name_ja}
        </p>
        <p className={`text-lg font-semibold tracking-tight ${dark ? "text-amber-200" : "text-amber-800"}`}>
          ฿{Number(product.sale_price ?? product.price).toLocaleString()}
        </p>
        <button
          type="button"
          onClick={onAdd}
          disabled={locked}
          className={`w-full rounded-xl px-3 py-2 text-sm font-medium transition ${
            locked
              ? "cursor-not-allowed bg-white/20 text-white/70"
              : dark
                ? "bg-amber-300 text-zinc-900 hover:bg-amber-200"
                : "bg-amber-900 text-amber-50 hover:bg-amber-950"
          }`}
        >
          {addLabel}
        </button>
      </div>
    </article>
  );
}

export default function AccountVipPage() {
  const audience = useAudience();
  const t = COPY[audience];
  const auth = useAuthSessionOptional();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [th, setTh] = useState<ThresholdRow | null>(null);

  const tier: Tier = auth?.vipTier ?? "normal";
  const lifetime = auth?.lifetimeSpentThb ?? 0;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createClient();
        const [{ data: pData }, { data: thData }] = await Promise.all([
          supabase
            .from("products")
            .select("id, name_ja, name_th, description_ja, description_th, price, sale_price, image_url, gallery_urls, stock, is_active, is_promotion, display_order, flavor_color, weight_g, is_set, set_quantity, price_variants, created_at, vip_required_tier, is_gold_exclusive")
            .eq("is_active", true)
            .order("display_order", { ascending: true }),
          supabase
            .from("vip_program_thresholds")
            .select("silver_lifetime_thb, gold_lifetime_thb")
            .eq("id", 1)
            .maybeSingle(),
        ]);
        if (cancelled) return;
        setProducts((pData ?? []) as Product[]);
        setTh((thData as ThresholdRow | null) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const silverProducts = useMemo(
    () => products.filter((p) => getProductVipRequiredTier(p) === "silver").slice(0, 6),
    [products],
  );
  const goldProducts = useMemo(
    () => products.filter((p) => getProductVipRequiredTier(p) === "gold").slice(0, 6),
    [products],
  );

  const loggedIn = Boolean(auth?.user);
  const vipTier = auth?.vipTier ?? null;

  const silverTh = Number(th?.silver_lifetime_thb ?? 6000);
  const goldTh = Number(th?.gold_lifetime_thb ?? 15000);
  const remainSilver = Math.max(0, silverTh - lifetime);
  const remainGold = Math.max(0, goldTh - lifetime);
  const silverPct = (lifetime / silverTh) * 100;
  const goldPct = (lifetime / goldTh) * 100;
  const dark = tier === "gold";

  const shellClass = dark
    ? "min-h-screen bg-[#111216] text-zinc-100 flex flex-col"
    : "min-h-screen bg-amber-50 flex flex-col";

  return (
    <div className={shellClass}>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        <section className={`rounded-3xl border p-6 ${dark ? "border-zinc-700 bg-zinc-900/70" : "border-amber-200 bg-white/80"}`}>
          <div className="flex items-center gap-2">
            <Crown className={`h-5 w-5 ${dark ? "text-amber-300" : "text-amber-700"}`} />
            <p className={`text-xs uppercase tracking-[0.26em] ${dark ? "text-zinc-400" : "text-amber-900/45"}`}>
              VIP
            </p>
          </div>
          <h1 className={`mt-2 text-3xl font-semibold tracking-tight ${dark ? "text-zinc-100" : "text-amber-950"}`}>{t.title}</h1>
          <p className={`mt-2 text-sm ${dark ? "text-zinc-300/75" : "text-amber-900/60"}`}>{t.subtitle}</p>
          <p className={`mt-3 text-sm ${dark ? "text-amber-200/90" : "text-amber-800/90"}`}>
            Lifetime: ฿{Number(lifetime).toLocaleString()} / Tier: <span className="uppercase">{tier}</span>
          </p>
          {!auth?.user ? (
            <div className="mt-4">
              <Link href="/login" className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${dark ? "bg-zinc-100 text-zinc-900" : "bg-amber-900 text-amber-50"}`}>
                <Sparkles className="h-4 w-4" />
                {t.signIn}
              </Link>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className={`text-xl font-medium ${dark ? "text-zinc-100" : "text-amber-950"}`}>{t.silverRoom}</h2>
            {(tier === "normal" || tier === "silver") && (
              <p className={`text-xs ${dark ? "text-zinc-400" : "text-amber-900/60"}`}>
                {t.unlockSoon.replace("{amount}", (tier === "normal" ? remainSilver : remainGold).toLocaleString())}
              </p>
            )}
          </div>
          {(tier === "normal" || tier === "silver") && (
            <ProgressBar value={tier === "normal" ? silverPct : goldPct} />
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!loading && silverProducts.length === 0 ? (
              <p className={`col-span-full text-center text-sm ${dark ? "text-zinc-400" : "text-amber-900/60"}`}>
                {t.emptySilver}
              </p>
            ) : null}
            {(loading ? [] : silverProducts).map((p) => {
              const unlocked = canPurchaseVipProduct(p, vipTier, loggedIn);
              const frame: "none" | "silver" | "gold" =
                unlocked && tier === "gold" ? "gold" : unlocked && tier === "silver" ? "silver" : "none";
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  locked={!unlocked}
                  dark={dark}
                  frame={frame}
                  unlockHint={!unlocked ? t.locked : undefined}
                  addLabel={t.addToCart}
                  onAdd={() => {
                    if (!canPurchaseVipProduct(p, vipTier, loggedIn)) return;
                    addToCart(p, 1, p.price_variants?.[0]?.size_g ?? null);
                  }}
                />
              );
            })}
          </div>
        </section>

        <section className="space-y-4 pb-6">
          <div className="flex items-end justify-between">
            <h2 className={`text-xl font-medium ${dark ? "text-zinc-100" : "text-amber-950"}`}>{t.goldRoom}</h2>
            {tier !== "gold" && (
              <p className={`text-xs ${dark ? "text-zinc-400" : "text-amber-900/60"}`}>
                {t.unlockSoon.replace("{amount}", remainGold.toLocaleString())}
              </p>
            )}
          </div>
          {tier !== "gold" && <ProgressBar value={goldPct} />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!loading && goldProducts.length === 0 ? (
              <p className={`col-span-full text-center text-sm ${dark ? "text-zinc-400" : "text-amber-900/60"}`}>
                {t.emptyGold}
              </p>
            ) : null}
            {(loading ? [] : goldProducts).map((p) => {
              const unlocked = canPurchaseVipProduct(p, vipTier, loggedIn);
              const frame: "none" | "silver" | "gold" = unlocked && tier === "gold" ? "gold" : "none";
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  locked={!unlocked}
                  dark={dark}
                  frame={frame}
                  unlockHint={!unlocked ? t.locked : undefined}
                  addLabel={t.addToCart}
                  onAdd={() => {
                    if (!canPurchaseVipProduct(p, vipTier, loggedIn)) return;
                    addToCart(p, 1, p.price_variants?.[0]?.size_g ?? null);
                  }}
                />
              );
            })}
          </div>
        </section>

        <div className="text-center">
          <Link href="/products" className={`text-sm underline-offset-4 hover:underline ${dark ? "text-zinc-300" : "text-amber-800"}`}>
            {t.toProducts}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
