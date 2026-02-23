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
  Calendar,
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

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(PIN_STORAGE_KEY) : null;
    setUnlocked(saved === "1");
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
    if (unlocked) fetchOrders();
    else setLoading(false);
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

  return (
    <div className="min-h-screen bg-emerald-50 pb-8">
      <div className="bg-emerald-600 text-white px-4 py-5 shadow flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">売上・比較</h1>
          <p className="text-emerald-100 text-sm">Sales & Thai price comparison</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium"
        >
          <ChevronLeft size={18} />
          注文一覧へ
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 期間 */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">期間:</span>
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === value
                  ? "bg-emerald-500 text-white"
                  : "bg-white border border-emerald-200 text-gray-700 hover:bg-emerald-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={40} className="animate-spin text-emerald-500 mb-3" />
            <p>กำลังโหลด...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* サマリカード */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <DollarSign size={18} />
                  <span className="text-sm font-medium">売上合計</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  ฿{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <ShoppingBag size={18} />
                  <span className="text-sm font-medium">注文数</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{orderCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium">平均客単価</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  ฿{avgOrderValue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* タイ人向け価格との差額 */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-900 mb-1">
                タイ人向け価格で売っていた場合との差（値上げによる増益）
              </h3>
              <p className="text-sm text-amber-800/80 mb-2">
                商品マスタで「タイ人向け価格」を入力した商品のみ集計。同じ販売個数を旧価格で売った場合との差額です。
              </p>
              <p className="text-2xl font-bold text-amber-900">
                ฿{totalGain.toLocaleString()}
                {totalGain > 0 && (
                  <span className="text-base font-normal text-amber-700 ml-2">
                    （サイト価格の方が高い分の増益）
                  </span>
                )}
              </p>
            </div>

            {/* 商品別テーブル */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
              <h3 className="px-4 py-3 font-bold text-gray-800 border-b border-emerald-100">
                商品別売上・比較
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-50 text-gray-700">
                      <th className="text-left px-4 py-2 font-semibold">商品名</th>
                      <th className="text-right px-4 py-2 font-semibold">販売数</th>
                      <th className="text-right px-4 py-2 font-semibold">実際の売上</th>
                      <th className="text-right px-4 py-2 font-semibold">割合</th>
                      <th className="text-right px-4 py-2 font-semibold">タイ人向け価格</th>
                      <th className="text-right px-4 py-2 font-semibold">旧価格での売上</th>
                      <th className="text-right px-4 py-2 font-semibold">差額（増益）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          この期間の注文はありません
                        </td>
                      </tr>
                    )}
                    {rows.map((r) => (
                      <tr
                        key={r.product_id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 font-medium text-gray-800">
                          {r.name}
                        </td>
                        <td className="px-4 py-2 text-right">{r.quantity}</td>
                        <td className="px-4 py-2 text-right">
                          ฿{r.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {totalRevenue > 0
                            ? `${((r.revenue / totalRevenue) * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {r.thai_price != null
                            ? `฿${r.thai_price.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {r.revenue_if_thai > 0
                            ? `฿${r.revenue_if_thai.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {r.gain !== 0 ? (
                            <span
                              className={
                                r.gain > 0
                                  ? "text-emerald-600 font-medium"
                                  : "text-gray-500"
                              }
                            >
                              {r.gain > 0 ? "+" : ""}฿{r.gain.toLocaleString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                    {rows.length > 0 && (
                      <tr className="border-t-2 border-emerald-200 bg-emerald-50/50 font-bold">
                        <td className="px-4 py-2 text-gray-800">合計</td>
                        <td className="px-4 py-2 text-right">—</td>
                        <td className="px-4 py-2 text-right">
                          ฿{totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">100%</td>
                        <td className="px-4 py-2 text-right">—</td>
                        <td className="px-4 py-2 text-right">—</td>
                        <td className="px-4 py-2 text-right text-emerald-600">
                          +฿{totalGain.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* グラフ */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">
                  商品別売上（上位10件）
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
              </div>
            )}

            {chartData.length > 0 && (
              <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">
                  商品別売上割合（円グラフ）
                </h3>
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
