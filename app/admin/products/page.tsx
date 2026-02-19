"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";
import { Product, FLAVOR_COLORS, FlavorColor } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Package,
  Eye,
  EyeOff,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; product: Product }
  | { type: "delete"; product: Product };

export default function AdminProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── 商品一覧を取得 ──────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── 削除 ────────────────────────────────────────────────
  async function handleDelete(product: Product) {
    setDeletingId(product.id);
    await supabase.from("products").delete().eq("id", product.id);

    // Storage の画像も削除
    if (product.image_url) {
      const path = product.image_url.split("/product-images/")[1];
      if (path) {
        await supabase.storage.from("product-images").remove([path]);
      }
    }

    setDeletingId(null);
    setModal({ type: "none" });
    fetchProducts();
  }

  // ─── 公開/非公開 切り替え ────────────────────────────────
  async function toggleActive(product: Product) {
    await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    fetchProducts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-5 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">🥜 商品管理</h1>
            <p className="text-white/80 text-sm">{products.length}件の商品</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              className="bg-white/20 text-white p-2.5 rounded-xl hover:bg-white/30 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setModal({ type: "add" })}
              className="bg-white text-amber-600 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-amber-50 transition-colors shadow"
            >
              <Plus size={18} />
              追加
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ローディング */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="text-amber-400 animate-spin" />
          </div>
        )}

        {/* 商品なし */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">商品がまだありません</p>
            <p className="text-gray-400 text-sm mt-1">
              「追加」ボタンから最初の商品を登録しましょう
            </p>
            <button
              onClick={() => setModal({ type: "add" })}
              className="mt-6 bg-amber-500 text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-amber-600 transition-colors"
            >
              <Plus size={18} />
              商品を追加する
            </button>
          </div>
        )}

        {/* 商品一覧（インスタグリッド風） */}
        {!loading && products.length > 0 && (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="flex gap-4 p-4">
                  {/* 商品画像 */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name_ja}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-amber-300" />
                      </div>
                    )}
                  </div>

                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {/* 味カラーバッジ */}
                        {product.flavor_color && product.flavor_color in FLAVOR_COLORS && (() => {
                          const c = FLAVOR_COLORS[product.flavor_color as FlavorColor];
                          return (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${c.bg} ${c.text}`}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                              {c.label}
                            </span>
                          );
                        })()}
                        <h3 className="font-bold text-gray-800 truncate">
                          {product.name_ja}
                        </h3>
                        {product.name_th && (
                          <p className="text-gray-400 text-xs truncate">{product.name_th}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            product.is_active
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {product.is_active ? "公開中" : "非公開"}
                        </span>
                        {product.is_set && (
                          <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                            <ShoppingBag size={10} />
                            セット
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 価格表示 */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {product.sale_price ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">
                            ฿{product.price.toLocaleString()}
                          </span>
                          <span className="text-red-500 font-bold text-lg">
                            ฿{product.sale_price.toLocaleString()}
                          </span>
                          <span className="bg-red-100 text-red-500 text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {Math.round(
                              (1 - product.sale_price / product.price) * 100
                            )}
                            % OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-700 font-bold text-lg">
                          ฿{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 text-xs mt-0.5">
                      在庫: {product.stock}個
                      {product.weight_g ? ` · ${product.weight_g}g` : ""}
                    </p>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="border-t border-gray-50 grid grid-cols-3">
                  <button
                    onClick={() => toggleActive(product)}
                    className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {product.is_active ? (
                      <>
                        <EyeOff size={16} className="text-gray-400" />
                        非公開に
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="text-green-500" />
                        公開する
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setModal({ type: "edit", product })}
                    className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors border-x border-gray-50"
                  >
                    <Pencil size={16} />
                    編集
                  </button>
                  <button
                    onClick={() => setModal({ type: "delete", product })}
                    className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── モーダル（追加・編集） ─────────────────────────── */}
      {(modal.type === "add" || modal.type === "edit") && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-full flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <ProductForm
                product={modal.type === "edit" ? modal.product : undefined}
                onSuccess={() => {
                  setModal({ type: "none" });
                  fetchProducts();
                }}
                onCancel={() => setModal({ type: "none" })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 削除確認モーダル ───────────────────────────────── */}
      {modal.type === "delete" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                本当に削除しますか？
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                「{modal.product.name_ja}」
              </p>
              <p className="text-gray-400 text-xs mb-6">
                この操作は取り消せません。画像も同時に削除されます。
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setModal({ type: "none" })}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDelete(modal.product)}
                  disabled={deletingId === modal.product.id}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deletingId === modal.product.id ? "削除中..." : "削除する"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
