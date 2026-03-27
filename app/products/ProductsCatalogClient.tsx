"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { Audience } from "@/lib/audience";
import type { Product } from "@/types";

type FlavorFilter = "all" | "set" | "original" | "cheese" | "bbq" | "nori" | "tomyum";
type SortKey = "recommended" | "price_asc" | "price_desc";

const FILTER_LABELS: Record<
  Audience,
  Record<FlavorFilter, string>
> = {
  ja: {
    all: "すべて",
    set: "詰め合わせ",
    original: "オリジナル",
    cheese: "チーズ",
    bbq: "BBQ",
    nori: "のり",
    tomyum: "トムヤム",
  },
  th: {
    all: "ทั้งหมด",
    set: "เซ็ต",
    original: "ดั้งเดิม",
    cheese: "ชีส",
    bbq: "บาร์บีคิว",
    nori: "สาหร่าย",
    tomyum: "ต้มยำ",
  },
};

const SORT_LABELS: Record<Audience, Record<SortKey, string>> = {
  ja: {
    recommended: "おすすめ順",
    price_asc: "価格の安い順",
    price_desc: "価格の高い順",
  },
  th: {
    recommended: "เรียงตามแนะนำ",
    price_asc: "ราคาต่ำไปสูง",
    price_desc: "ราคาสูงไปต่ำ",
  },
};

function getEffectiveLowestPrice(product: Product): number {
  const base = product.sale_price ?? product.price;
  if (!Array.isArray(product.price_variants) || product.price_variants.length === 0) return base;
  let best = base;
  for (const v of product.price_variants) {
    const p = v.sale_price != null && v.sale_price < v.price ? v.sale_price : v.price;
    if (p < best) best = p;
  }
  return best;
}

type Props = {
  products: Product[];
  audience: Audience;
};

export default function ProductsCatalogClient({ products, audience }: Props) {
  const [filter, setFilter] = useState<FlavorFilter>("all");
  const [sort, setSort] = useState<SortKey>("recommended");

  const filteredAndSorted = useMemo(() => {
    let list = products.filter((p) => p.is_active);
    if (filter === "set") {
      list = list.filter((p) => p.is_set);
    } else if (filter !== "all") {
      list = list.filter((p) => !p.is_set && p.flavor_color === filter);
    }

    const sorted = [...list];
    if (sort === "price_asc") {
      sorted.sort((a, b) => getEffectiveLowestPrice(a) - getEffectiveLowestPrice(b));
    } else if (sort === "price_desc") {
      sorted.sort((a, b) => getEffectiveLowestPrice(b) - getEffectiveLowestPrice(a));
    } else {
      sorted.sort((a, b) => {
        const promo = Number(Boolean(b.is_promotion)) - Number(Boolean(a.is_promotion));
        if (promo !== 0) return promo;
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    return sorted;
  }, [products, filter, sort]);

  const singleProducts = filteredAndSorted.filter((p) => !p.is_set);
  const setProducts = filteredAndSorted.filter((p) => p.is_set);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-200 bg-white/80 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FILTER_LABELS[audience]) as FlavorFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  filter === key
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                }`}
              >
                {FILTER_LABELS[audience][key]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-amber-800/70">
              {audience === "ja" ? "並び替え" : "เรียงลำดับ"}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="recommended">{SORT_LABELS[audience].recommended}</option>
              <option value="price_asc">{SORT_LABELS[audience].price_asc}</option>
              <option value="price_desc">{SORT_LABELS[audience].price_desc}</option>
            </select>
          </div>
        </div>
      </section>

      {singleProducts.length > 0 && (
        <section
          id="single"
          aria-label={audience === "ja" ? "単品商品" : "สินค้าเดี่ยว"}
          className="rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {singleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {setProducts.length > 0 && (
        <section
          id="set"
          aria-label={audience === "ja" ? "詰め合わせ・お得セット" : "ชุดเซ็ต"}
          className="rounded-2xl bg-orange-50/80 border-2 border-orange-200 p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {setProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-10 text-sm text-amber-800/70">
          {audience === "ja"
            ? "条件に合う商品が見つかりませんでした。"
            : "ไม่พบสินค้าที่ตรงกับเงื่อนไข"}
        </div>
      )}
    </div>
  );
}
