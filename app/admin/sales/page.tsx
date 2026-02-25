"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ChevronLeft,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Loader2,
  Lock,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Table2,
} from "lucide-react";

const ADMIN_PIN = "607051";
const PIN_STORAGE_KEY = "admin-unlocked";

type ProductRow = {
  id: string;
  name_ja?: string | null;
  name_th?: string | null;
  thai_price?: number | null;
};

type OrderItemRow = {
  product_id: string;
  quantity: number;
  unit_price?: number | null;
  price?: number | null;
  products?: ProductRow | null;
};

type OrderRow = {
  id: string;
  total_amount: number;
  created_at: string;
  order_items?: OrderItemRow[];
};

/** API 戻り値: Supabase は products を配列で返すことがある */
type RawOrderRow = Omit<OrderRow, "order_items"> & {
  order_items?: (Omit<OrderItemRow, "products"> & {
    products?: ProductRow | ProductRow[] | null;
  })[];
};

/** Supabase はリレーションを products: ProductRow[] で返すことがあるため、単一オブジェクトに正規化 */
function normalizeOrders(raw: RawOrderRow[]): OrderRow[] {
  return raw.map((order) => ({
    ...order,
    order_items: (order.order_items ?? []).map((item) => ({
      ...item,
      products: Array.isArray(item.products)
        ? (item.products[0] as ProductRow) ?? null
        : item.products ?? null,
    })),
  })) as OrderRow[];
}

type Period = "all" | "this_month" | "last_month";

function getPeriodBounds(period: Period): { start: Date; end: Date } | null {
  const now = new Date();
  if (period === "all") return null;
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  if (period === "this_month") return { start, end };
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  return { start: lastStart, end: lastEnd };
}

function filterOrdersByPeriod(orders: OrderRow[], period: Period): OrderRow[] {
  const bounds = getPeriodBounds(period);
  if (!bounds) return orders;
  return orders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t >= bounds!.start.getTime() && t <= bounds!.end.getTime();
  });
}

type ProductAgg = {
  product_id: string;
  name: string;
  quantity: number;
  revenue: number;
  thai_price: number | null;
  revenue_if_thai: number;
  gain: number;
};

function aggregateByProduct(
  orders: OrderRow[],
  period: Period
): { rows: ProductAgg[]; totalRevenue: number; totalGain: number; orderCount: number } {
  const filtered = filterOrdersByPeriod(orders, period);
  const map = new Map<
    string,
    { name: string; quantity: number; revenue: number; thai_price: number | null }
  >();

  for (const order of filtered) {
    for (const item of order.order_items ?? []) {
      const pid = item.product_id;
      const name =
        item.products?.name_ja ||
        item.products?.name_th ||
        `#${pid.slice(0, 8)}`;
      const unitPrice = item.unit_price ?? item.price ?? 0;
      const revenue = item.quantity * unitPrice;
      const thaiPrice =
        item.products?.thai_price != null ? item.products.thai_price : null;

      const cur = map.get(pid);
      if (!cur) {
        map.set(pid, {
          name,
          quantity: item.quantity,
          revenue,
          thai_price: thaiPrice,
        });
      } else {
        cur.quantity += item.quantity;
        cur.revenue += revenue;
        if (thaiPrice != null) cur.thai_price = thaiPrice;
      }
    }
  }

  const rows: ProductAgg[] = [];
  let totalRevenue = 0;
  let totalGain = 0;
  for (const [product_id, v] of map) {
    const revenueIfThai =
      v.thai_price != null ? v.quantity * v.thai_price : 0;
    const gain = v.revenue - revenueIfThai;
    totalRevenue += v.revenue;
    totalGain += gain;
    rows.push({
      product_id,
      name: v.name,
      quantity: v.quantity,
      revenue: v.revenue,
      thai_price: v.thai_price,
      revenue_if_thai: revenueIfThai,
      gain,
    });
  }
  rows.sort((a, b) => b.revenue - a.revenue);

  return {
    rows,
    totalRevenue,
    totalGain,
    orderCount: filtered.length,
  };
}

const CHART_COLORS = [
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#65a30d",
  "#ea580c",
  "#be185d",
];

export default function AdminSalesPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(PIN_STORAGE_KEY) : null;
    queueMicrotask(() => setUnlocked(saved === "1"));
  }, []);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        created_at,
        order_items (
          product_id,
          quantity,
          unit_price,
          price,
          products (
            id,
            name_ja,
            name_th,
            thai_price
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setOrders([]);
    } else {
      const raw: unknown = data ?? [];
      setOrders(normalizeOrders(raw as RawOrderRow[]));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      if (unlocked) fetchOrders();
      else setLoading(false);
    });
  }, [unlocked, fetchOrders]);

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    if (pinInput.trim() === ADMIN_PIN) {
      if (typeof window !== "undefined")
        localStorage.setItem(PIN_STORAGE_KEY, "1");
      setUnlocked(true);
      setPinInput("");
    } else {
      setPinError("รหัสผ่านไม่ถูกต้อง");
    }
  }

  async function updateThaiPrice(productId: string, rawValue: string) {
    const trimmed = rawValue.trim();
    const value =
      trimmed === "" ? null : Math.floor(Number(trimmed)) || null;
    setSavingProductId(productId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ thai_price: value })
        .eq("id", productId);
      if (error) throw error;
      await fetchOrders();
    } catch {
      // 保存失敗時はリフレッシュで元に戻る
      await fetchOrders();
    } finally {
      setSavingProductId(null);
    }
  }

  const { rows, totalRevenue, totalGain, orderCount } = aggregateByProduct(
    orders,
    period
  );
  const avgOrderValue =
    orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  const chartData = rows.slice(0, 10).map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name,
    fullName: r.name,
    revenue: r.revenue,
    quantity: r.quantity,
  }));

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
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
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

  const periodLabel =
    period === "all" ? "全期間" : period === "this_month" ? "今月" : "先月";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="注文一覧へ"
            >
              <ChevronLeft size={22} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">売上記録表</h1>
              <p className="text-slate-500 text-sm">Sales report · 商品別・期間別</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "読込中…" : "更新"}
          </button>
        </div>

        {/* 期間タブ */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            {(
              [
                { value: "all" as Period, label: "全期間" },
                { value: "this_month" as Period, label: "今月" },
                { value: "last_month" as Period, label: "先月" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === value
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
            <p className="text-sm">読み込み中…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* サマリカード 4枚 */}
            <section>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <DollarSign size={18} />
                    <span className="text-xs font-medium uppercase tracking-wider">売上合計</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 tabular-nums">
                    ฿{totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">{periodLabel}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <ShoppingBag size={18} />
                    <span className="text-xs font-medium uppercase tracking-wider">注文数</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 tabular-nums">{orderCount}</p>
                  <p className="text-slate-400 text-xs mt-1">件</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <TrendingUp size={18} />
                    <span className="text-xs font-medium uppercase tracking-wider">平均客単価</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 tabular-nums">
                    ฿{avgOrderValue.toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">/ 1注文</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <BarChart3 size={18} />
                    <span className="text-xs font-medium uppercase tracking-wider">増益</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900 tabular-nums">
                    +฿{totalGain.toLocaleString()}
                  </p>
                  <p className="text-amber-600/80 text-xs mt-1">タイ価格との差額</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                増益＝サイト価格での売上 − タイ人向け価格で同数売った場合の売上。商品マスタで「タイ人向け価格」を入力したもののみ集計。
              </p>
            </section>

            {/* 商品別売上テーブル */}
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Table2 size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-800">商品別売上・比較</h2>
              </div>
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="sticky top-0 z-[1] bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 w-[20%]">商品名</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700 w-[10%]">販売数</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700 w-[14%]">実際の売上</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700 w-[12%]">割合</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700 w-[14%]">タイ価格</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700 w-[14%]">旧価格売上</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700 w-[16%]">差額（増益）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                          <ShoppingBag size={40} className="mx-auto mb-2 text-slate-300" />
                          <p>この期間の注文はありません</p>
                        </td>
                      </tr>
                    )}
                    {rows.map((r, idx) => {
                      const pct = totalRevenue > 0 ? (r.revenue / totalRevenue) * 100 : 0;
                      return (
                        <tr
                          key={r.product_id}
                          className={`border-b border-slate-100 hover:bg-slate-50/80 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-800 align-middle">
                            {r.name}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                            {r.quantity}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-800">
                            ฿{r.revenue.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right align-middle">
                            {totalRevenue > 0 ? (
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-400 rounded-full min-w-[2px]"
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <span className="tabular-nums text-slate-600 w-10">
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-2 text-right align-middle">
                            {savingProductId === r.product_id ? (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Loader2 size={14} className="animate-spin" />
                                保存中
                              </span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="—"
                                defaultValue={r.thai_price != null ? String(r.thai_price) : ""}
                                onBlur={(e) =>
                                  updateThaiPrice(r.product_id, e.currentTarget.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-20 text-right tabular-nums border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                            {r.revenue_if_thai > 0
                              ? `฿${r.revenue_if_thai.toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {r.gain !== 0 ? (
                              <span
                                className={`tabular-nums font-medium ${
                                  r.gain > 0 ? "text-emerald-600" : "text-slate-500"
                                }`}
                              >
                                {r.gain > 0 ? "+" : ""}฿{r.gain.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length > 0 && (
                      <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-200 sticky bottom-0">
                        <td className="px-4 py-3 text-slate-800">合計</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">—</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                          ฿{totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">100%</td>
                        <td className="px-4 py-3 text-right">—</td>
                        <td className="px-4 py-3 text-right">—</td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-600">
                          +฿{totalGain.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* グラフ */}
            {chartData.length > 0 && (
              <>
                <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-emerald-600" />
                    <h2 className="font-bold text-slate-800">商品別売上（上位10件）</h2>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number | undefined) => [`฿${(value ?? 0).toLocaleString()}`, "売上"]}
                          labelFormatter={(_, payload) =>
                            payload?.[0]?.payload?.fullName ?? ""
                          }
                        />
                        <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChartIcon size={20} className="text-emerald-600" />
                    <h2 className="font-bold text-slate-800">売上割合（円グラフ）</h2>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="revenue"
                          nameKey="fullName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {chartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number | undefined) => `฿${(value ?? 0).toLocaleString()}`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
