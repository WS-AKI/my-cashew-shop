"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Lock, ShoppingBag, MapPin, Package, Loader2, ImageIcon } from "lucide-react";

const ADMIN_PIN = "607051";
const PIN_STORAGE_KEY = "admin-unlocked";

const STATUS_OPTIONS = [
  { value: "pending", label: "รอตรวจสอบ" },
  { value: "paid", label: "ชำระเงินแล้ว" },
  { value: "shipped", label: "จัดส่งแล้ว" },
] as const;

const ALLOWED_STATUSES: string[] = ["pending", "paid", "shipped"];
function normalizeOrderStatus(s: string | undefined | null): string {
  const lower = (s ?? "").toLowerCase();
  return ALLOWED_STATUSES.includes(lower) ? lower : "pending";
}

type ProductRow = { name_ja?: string; name_th?: string; weight_g?: number | null; flavor_color?: string | null } | null;
type OrderItemRow = {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number | null;
  price?: number | null;
  products?: ProductRow;
};
type OrderRow = {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  user_phone?: string | null;
  address?: string | null;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  order_notes: string | null;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
  slip_image_url?: string | null;
  order_items?: OrderItemRow[];
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${h}:${m}`;
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PIN_STORAGE_KEY) : null;
    setUnlocked(saved === "1");
  }, []);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            name_ja,
            name_th,
            weight_g,
            flavor_color
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setOrders([]);
    } else {
      setOrders((data as OrderRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (unlocked) fetchOrders();
    else setLoading(false);
  }, [unlocked, fetchOrders]);

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    if (pinInput.trim() === ADMIN_PIN) {
      if (typeof window !== "undefined") localStorage.setItem(PIN_STORAGE_KEY, "1");
      setUnlocked(true);
      setPinInput("");
    } else {
      setPinError("รหัสผ่านไม่ถูกต้อง");
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    await fetchOrders();
    setUpdatingId(null);
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Lock size={28} className="text-emerald-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-800 text-center mb-1">
            ระบบจัดการร้านค้า
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6">Shop Admin</p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                กรุณาใส่รหัสผ่าน
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
                placeholder="••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            {pinError && (
              <p className="text-red-600 text-sm text-center">{pinError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 pb-8">
      <div className="bg-emerald-600 text-white px-4 py-5 shadow">
        <h1 className="text-lg font-bold">ระบบจัดการร้านค้า</h1>
        <p className="text-emerald-100 text-sm">Shop Admin</p>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag size={20} className="text-emerald-600" />
          รายการคำสั่งซื้อ
        </h2>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={40} className="animate-spin text-emerald-500 mb-3" />
            <p>กำลังโหลด...</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-emerald-200" />
            <p className="font-medium">ยังไม่มีรายการคำสั่งซื้อ</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden"
              >
                {/** スキーマ差分（user_* / shipping_*）の両方に対応 */}
                {(() => {
                  const displayName = order.user_name || order.shipping_name || "-";
                  const displayPhone = order.user_phone || order.shipping_phone || "-";
                  const displayAddress = order.address || order.shipping_address || "-";
                  return (
                    <>
                <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-800">
                    #{shortId(order.id)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(order.created_at)}
                  </span>
                  <select
                    value={normalizeOrderStatus(order.status)}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="text-sm font-medium rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">ลูกค้า · Customer</p>
                    <p className="font-semibold text-gray-800">{displayName}</p>
                    <p className="text-gray-600 text-sm">{displayPhone}</p>
                  </div>

                  <details className="group">
                    <summary className="flex items-center gap-2 text-sm text-emerald-600 cursor-pointer list-none">
                      <MapPin size={14} />
                      ที่อยู่
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap pl-5">
                      {displayAddress}
                    </p>
                    {order.order_notes && (
                      <p className="mt-2 text-amber-700 text-sm pl-5">
                        หมายเหตุ: {order.order_notes}
                      </p>
                    )}
                  </details>

                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1.5">รายการสินค้า · Items</p>
                    <ul className="space-y-1.5">
                      {(order.order_items ?? []).map((item, i) => {
                        const name =
                          item.products?.name_ja ||
                          item.products?.name_th ||
                          `#${item.product_id.slice(0, 6)}`;
                        const weightLabel = item.products?.weight_g ? `${item.products.weight_g}g` : "";
                        const lineUnitPrice = item.unit_price ?? item.price ?? 0;
                        return (
                          <li
                            key={item.id ?? i}
                            className="flex justify-between text-sm text-gray-700"
                          >
                            <span>
                              {name}
                              {weightLabel && (
                                <span className="ml-1 text-xs text-gray-400">{weightLabel}</span>
                              )}
                              {" "}× {item.quantity}
                            </span>
                            <span>฿{(lineUnitPrice * item.quantity).toLocaleString()}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-emerald-50">
                    <span className="text-gray-500 text-sm">ยอดรวม · Total</span>
                    <span className="font-bold text-emerald-700 text-lg">
                      ฿{order.total_amount.toLocaleString()}
                    </span>
                  </div>

                  {order.slip_image_url && (
                    <div className="pt-2 border-t border-emerald-50">
                      <p className="text-xs text-gray-400 font-medium mb-1.5">
                        หลักฐานการโอน · Transfer Proof
                      </p>
                      <a
                        href={order.slip_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                      >
                        <ImageIcon size={16} />
                        ดูสลิป · View Slip
                      </a>
                      <a
                        href={order.slip_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block w-20 h-20 relative rounded border border-emerald-200 overflow-hidden"
                      >
                        <Image
                          src={order.slip_image_url}
                          alt="หลักฐานการโอน"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </a>
                    </div>
                  )}
                </div>
                    </>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
