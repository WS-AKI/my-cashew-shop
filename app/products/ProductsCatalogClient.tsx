"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import type { Audience } from "@/lib/audience";
import type { Product } from "@/types";

type FlavorFilter = "all" | "set" | "original" | "cheese" | "bbq" | "nori" | "tomyum";
type SortKey = "recommended" | "price_asc" | "price_desc";

const FILTER_LABELS_BY_AUDIENCE: Record<Audience, Record<FlavorFilter, string>> = {
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

const SORT_LABELS_BY_AUDIENCE: Record<Audience, Record<SortKey, string>> = {
  ja: { recommended: "おすすめ順", price_asc: "価格の安い順", price_desc: "価格の高い順" },
  th: { recommended: "เรียงตามแนะนำ", price_asc: "ราคาต่ำไปสูง", price_desc: "ราคาสูงไปต่ำ" },
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
  /** サーバー側でデータ取得に失敗した場合のエラーメッセージ */
  productsLoadError?: string;
};

export default function ProductsCatalogClient({ products, audience, productsLoadError }: Props) {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<FlavorFilter>("all");
  const [sort, setSort] = useState<SortKey>("recommended");

  // EN のときはロケール辞書、それ以外は audience ベース
  const filterLabels: Record<FlavorFilter, string> =
    language === "en"
      ? {
          all: t.productsPage.filterAll,
          set: t.productsPage.filterSet,
          original: t.productsPage.filterOriginal,
          cheese: t.productsPage.filterCheese,
          bbq: t.productsPage.filterBbq,
          nori: t.productsPage.filterNori,
          tomyum: t.productsPage.filterTomyum,
        }
      : FILTER_LABELS_BY_AUDIENCE[audience];

  const sortLabels: Record<SortKey, string> =
    language === "en"
      ? {
          recommended: t.productsPage.sortRecommended,
          price_asc: t.productsPage.sortPriceAsc,
          price_desc: t.productsPage.sortPriceDesc,
        }
      : SORT_LABELS_BY_AUDIENCE[audience];

  const sortLabel =
    language === "en" ? t.productsPage.sortLabel : audience === "ja" ? "並び替え" : "เรียงลำดับ";
  const noResultsText =
    language === "en"
      ? t.productsPage.noResults
      : audience === "ja"
      ? "条件に合う商品が見つかりませんでした。"
      : "ไม่พบสินค้าที่ตรงกับเงื่อนไข";
  const singleSectionLabel =
    language === "en"
      ? t.productsPage.singleSection
      : audience === "ja"
      ? "単品商品"
      : "สินค้าเดี่ยว";
  const setSectionLabel =
    language === "en"
      ? t.productsPage.setSection
      : audience === "ja"
      ? "詰め合わせ・お得セット"
      : "ชุดเซ็ต";

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

  // サーバー側エラーを言語対応で表示
  if (productsLoadError) {
    const errMsg =
      language === "en"
        ? t.productsPage.loadError
        : audience === "ja"
        ? "商品の読み込みに失敗しました。ページを再読み込みしてください。"
        : "โหลดสินค้าไม่สำเร็จ กรุณารีเฟรชหน้า";
    return (
      <div className="text-center py-10">
        <p className="text-amber-700 font-medium">{errMsg}</p>
        <p className="text-amber-500 text-xs mt-2 font-mono">{productsLoadError}</p>
      </div>
    );
  }

  const singleProducts = filteredAndSorted.filter((p) => !p.is_set);
  const setProducts = filteredAndSorted.filter((p) => p.is_set);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-200 bg-white/80 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as FlavorFilter[]).map((key) => (
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
                {filterLabels[key]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-amber-800/70">{sortLabel}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="recommended">{sortLabels.recommended}</option>
              <option value="price_asc">{sortLabels.price_asc}</option>
              <option value="price_desc">{sortLabels.price_desc}</option>
            </select>
          </div>
        </div>
      </section>

      {singleProducts.length > 0 && (
        <section
          id="single"
          aria-label={singleSectionLabel}
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
          aria-label={setSectionLabel}
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
        <div className="text-center py-10 text-sm text-amber-800/70">{noResultsText}</div>
      )}
    </div>
  );
}
