"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";
import { Product, FLAVOR_COLORS, FlavorColor } from "@/types";
import {
  Plus, Pencil, Trash2, RefreshCw, Package,
  Eye, EyeOff, AlertCircle, ShoppingBag, Search,
} from "lucide-react";

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; product: Product }
  | { type: "delete"; product: Product };

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState<ModalState>({ type: "none" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("display_order", { ascending: true });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { queueMicrotask(() => fetchProducts()); }, [fetchProducts]);

  async function handleDelete(product: Product) {
    setDeletingId(product.id);
    await supabase.from("products").delete().eq("id", product.id);
    if (product.image_url) {
      const path = product.image_url.split("/product-images/")[1];
      if (path) await supabase.storage.from("product-images").remove([path]);
    }
    setDeletingId(null);
    setModal({ type: "none" });
    fetchProducts();
  }

  async function toggleActive(product: Product) {
    await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id);
    fetchProducts();
  }

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name_ja?.toLowerCase().includes(q) ||
      p.name_th?.toLowerCase().includes(q) ||
      false
    );
  });

  const activeCount   = products.filter((p) => p.is_active).length;
  const inactiveCount = products.filter((p) => !p.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* ページタイトルバー */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Package size={20} className="text-amber-500" />
              商品管理
              <span className="text-slate-400 font-normal text-sm ml-1">· จัดการสินค้า</span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              全 {products.length} 件
              <span className="ml-2 text-emerald-600">公開 {activeCount}</span>
              <span className="ml-1 text-slate-400">/ 非公開 {inactiveCount}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors disabled:opacity-50"
              title="更新"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setModal({ type: "add" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors shadow-sm"
            >
              <Plus size={17} />
              商品追加 · เพิ่มสินค้า
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        {/* 検索バー */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名で検索 · ค้นหาสินค้า…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <RefreshCw size={32} className="text-amber-400 animate-spin" />
          </div>
        )}

        {/* 商品なし */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <Package size={56} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">商品がまだありません · ยังไม่มีสินค้า</p>
            <button
              onClick={() => setModal({ type: "add" })}
              className="mt-5 bg-amber-500 text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-amber-600 transition-colors"
            >
              <Plus size={17} />
              最初の商品を追加
            </button>
          </div>
        )}

        {/* 商品グリッド */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((product) => {
              const fc = product.flavor_color && product.flavor_color in FLAVOR_COLORS
                ? FLAVOR_COLORS[product.flavor_color as FlavorColor]
                : null;
              const hasVariants = product.price_variants && product.price_variants.length > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 p-4">
                    {/* 画像 */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0 border border-amber-100">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name_ja} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={26} className="text-amber-200" />
                        </div>
                      )}
                    </div>

                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {/* バッジ行 */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {fc && (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${fc.bg} ${fc.text}`}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fc.hex }} />
                                {fc.label}
                              </span>
                            )}
                            {product.is_set && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                <ShoppingBag size={10} />セット
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 text-sm leading-snug truncate">{product.name_ja}</p>
                          {product.name_th && (
                            <p className="text-slate-400 text-xs truncate">{product.name_th}</p>
                          )}
                        </div>

                        {/* 公開バッジ */}
                        <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${product.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                          {product.is_active ? "公開中" : "非公開"}
                        </span>
                      </div>

                      {/* 価格 */}
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {hasVariants ? (
                          <span className="text-xs text-slate-500">
                            ฿{Math.min(...product.price_variants.map((v) => v.sale_price ?? v.price)).toLocaleString()}〜
                          </span>
                        ) : product.sale_price ? (
                          <>
                            <span className="text-slate-400 line-through text-xs">฿{product.price.toLocaleString()}</span>
                            <span className="text-red-500 font-bold">฿{product.sale_price.toLocaleString()}</span>
                            <span className="bg-red-100 text-red-500 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                              {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-700 font-bold">฿{product.price.toLocaleString()}</span>
                        )}
                      </div>

                      <p className="text-slate-400 text-xs mt-0.5">
                        在庫 {product.stock}個
                        {product.weight_g ? ` · ${product.weight_g}g` : ""}
                        {hasVariants ? ` · ${product.price_variants.length}サイズ` : ""}
                      </p>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100">
                    <button
                      onClick={() => toggleActive(product)}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {product.is_active
                        ? <><EyeOff size={14} className="text-slate-400" />非公開に · ซ่อน</>
                        : <><Eye size={14} className="text-emerald-500" />公開する · แสดง</>}
                    </button>
                    <button
                      onClick={() => setModal({ type: "edit", product })}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Pencil size={14} />編集 · แก้ไข
                    </button>
                    <button
                      onClick={() => setModal({ type: "delete", product })}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />削除 · ลบ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 検索結果なし */}
        {!loading && products.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Search size={40} className="text-slate-300 mx-auto mb-3" />
            <p>「{search}」に一致する商品がありません</p>
          </div>
        )}
      </div>

      {/* ── 追加・編集モーダル ──────────────────────────────────── */}
      {(modal.type === "add" || modal.type === "edit") && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-full flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <ProductForm
                product={modal.type === "edit" ? modal.product : undefined}
                onSuccess={() => { setModal({ type: "none" }); fetchProducts(); }}
                onCancel={() => setModal({ type: "none" })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 削除確認モーダル ────────────────────────────────────── */}
      {modal.type === "delete" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle size={30} className="text-red-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">削除しますか？</h3>
              <p className="text-slate-500 text-sm">ต้องการลบสินค้านี้?</p>
              <p className="text-slate-700 font-semibold mt-2 mb-1">「{modal.product.name_ja}」</p>
              <p className="text-slate-400 text-xs mb-6">この操作は取り消せません · ไม่สามารถยกเลิกได้</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setModal({ type: "none" })}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  キャンセル · ยกเลิก
                </button>
                <button
                  onClick={() => handleDelete(modal.product)}
                  disabled={deletingId === modal.product.id}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deletingId === modal.product.id ? "削除中…" : "削除 · ลบ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
