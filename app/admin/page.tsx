"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
  Lock, ShoppingBag, MapPin, Package, Loader2,
  ImageIcon, MessageCircle, Send, Store, User, Trash2,
  RefreshCw, ChevronDown, Truck, Tag,
} from "lucide-react";
import { ADMIN_API_PIN_SESSION_KEY, adminApiPinHeaders } from "@/lib/admin-session";
import { verifyAdminPinWithServer } from "@/lib/admin-verify-pin-client";
import { normalizeOrderDbStatus } from "@/lib/order-progress";

// ── フレーバー表示 ─────────────────────────────────────────────────
const FLAVOR_LABELS: Record<string, { ja: string; th: string }> = {
  original:      { ja: "オリジナル",        th: "รสดั้งเดิม" },
  original_salt: { ja: "オリジナル（塩あり）", th: "รสดั้งเดิม (เกลือ)" },
  original_nosalt:{ ja: "オリジナル（塩なし）",th: "รสดั้งเดิม (ไม่เกลือ)" },
  cheese:        { ja: "チーズ",            th: "รสชีส" },
  bbq:           { ja: "BBQ",              th: "รสบาร์บีคิว" },
  nori:          { ja: "のり",              th: "รสสาหร่าย" },
  tomyum:        { ja: "トムヤム",           th: "รสต้มยำ" },
};

function formatMetaFlavors(meta: Record<string, unknown> | null | undefined): string {
  if (!meta || typeof meta !== "object") return "";
  const parts: string[] = [];
  const flavors = meta.flavors as Record<string, number> | undefined;
  if (flavors) {
    const s = Object.entries(flavors)
      .filter(([, n]) => typeof n === "number" && n > 0)
      .map(([k, n]) => `${FLAVOR_LABELS[k]?.ja ?? k} ×${n}`)
      .join(", ");
    if (s) parts.push(s);
  }
  const salt = meta.salt_option as string | undefined;
  if (salt === "with_salt") parts.push("塩あり");
  if (salt === "no_salt")   parts.push("塩なし");
  return parts.join(" · ");
}

// ── 定数 ─────────────────────────────────────────────────────────
const PIN_STORAGE_KEY = "admin-unlocked";
const ORDERS_PAGE_SIZE = 20;
const ADMIN_FETCH_TIMEOUT_MS = 10000;

const STATUS_CONFIG = {
  pending:         { label: "未確認",   labelTh: "รอตรวจสอบ",      color: "bg-amber-100  text-amber-700   border-amber-300"  },
  price_confirmed: { label: "料金確認", labelTh: "ยืนยันค่าจัดส่ง", color: "bg-blue-100   text-blue-700    border-blue-300"   },
  shipping:        { label: "配達中",   labelTh: "กำลังจัดส่ง",     color: "bg-violet-100 text-violet-700  border-violet-300" },
  delivered:       { label: "配達済み", labelTh: "จัดส่งแล้ว",      color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
} as const;

const STATUS_OPTIONS = [
  { value: "pending",         label: "⏳ 未確認 · รอตรวจสอบ" },
  { value: "price_confirmed", label: "💰 料金確認 · ยืนยันค่าจัดส่ง" },
  { value: "shipping",        label: "🚚 配達中 · กำลังจัดส่ง" },
  { value: "delivered",       label: "✅ 配達済み · จัดส่งแล้ว" },
] as const;

const ALLOWED_STATUSES = ["pending", "price_confirmed", "shipping", "delivered"] as const;
function normalizeOrderStatus(s: string | undefined | null): (typeof ALLOWED_STATUSES)[number] {
  return normalizeOrderDbStatus(s);
}

// ── 型定義 ────────────────────────────────────────────────────────
type ProductRow = { name_ja?: string; name_th?: string; weight_g?: number | null; flavor_color?: string | null } | null;
type OrderItemRow = {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number | null;
  meta?: Record<string, unknown> | null;
  products?: ProductRow;
};
type MsgRow = {
  id: string;
  order_id: string;
  sender: "customer" | "shop";
  body: string;
  created_at: string;
};
type OrderRow = {
  id: string;
  user_name?: string | null;
  user_phone?: string | null;
  address?: string | null;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  order_email?: string | null;
  order_email_normalized?: string | null;
  order_notes?: string | null;
  total_amount: number;
  discount_amount?: number | null;
  shipping_fee?: number | null;
  status: string;
  paid_at?: string | null;
  loyalty_profile_id?: string | null;
  created_at: string;
  slip_image_url?: string | null;
  order_items?: OrderItemRow[];
  order_messages?: MsgRow[];
};

type RawOrderRow = Omit<OrderRow, "order_items"> & {
  order_items?: (Omit<OrderItemRow, "products"> & {
    products?: ProductRow | ProductRow[] | null;
  })[];
};

function normalizeOrders(raw: RawOrderRow[]): OrderRow[] {
  return raw.map((o) => ({
    ...o,
    order_items: (o.order_items ?? []).map((item) => ({
      ...item,
      products: Array.isArray(item.products)
        ? (item.products[0] as ProductRow) ?? null
        : item.products ?? null,
    })),
  })) as OrderRow[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function normalizeEmailQuery(raw: string): string {
  return raw.trim().toLowerCase();
}

// ── メインコンポーネント ───────────────────────────────────────────
export default function AdminPage() {
  const [unlocked, setUnlocked]   = useState(false);
  const [pinInput, setPinInput]   = useState("");
  const [pinError, setPinError]   = useState("");
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [orders, setOrders]       = useState<OrderRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replySending, setReplySending] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailQuery, setEmailQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(PIN_STORAGE_KEY);
    const apiPin = sessionStorage.getItem(ADMIN_API_PIN_SESSION_KEY);
    if (saved === "1" && apiPin) {
      queueMicrotask(() => setUnlocked(true));
    } else if (saved === "1" && !apiPin) {
      localStorage.removeItem(PIN_STORAGE_KEY);
      queueMicrotask(() => setUnlocked(false));
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = page * ORDERS_PAGE_SIZE;
    const to = from + ORDERS_PAGE_SIZE;
    let query = supabase
      .from("orders")
      .select(`
        id, user_name, user_phone, address,
        shipping_name, shipping_phone, shipping_address,
        order_email, order_email_normalized,
        order_notes, total_amount, discount_amount, shipping_fee,
        status, paid_at, loyalty_profile_id, created_at, slip_image_url,
        order_items (
          id, order_id, product_id, quantity, unit_price, meta,
          products ( name_ja, name_th, weight_g, flavor_color )
        ),
        order_messages ( id, order_id, sender, body, created_at )
      `)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (emailQuery) {
      query = query.ilike("order_email_normalized", `%${emailQuery}%`);
    }
    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), ADMIN_FETCH_TIMEOUT_MS);
    const { data, error } = await query.abortSignal(ac.signal);
    clearTimeout(tid);

    if (!error) {
      const rows = (data ?? []) as unknown as RawOrderRow[];
      const hasMore = rows.length > ORDERS_PAGE_SIZE;
      const pageRows = hasMore ? rows.slice(0, ORDERS_PAGE_SIZE) : rows;
      setHasNextPage(hasMore);
      setOrders(normalizeOrders(pageRows));
    }
    setLoading(false);
  }, [page, emailQuery]);

  useEffect(() => {
    queueMicrotask(() => { if (unlocked) fetchOrders(); else setLoading(false); });
  }, [unlocked, fetchOrders]);

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    setPinSubmitting(true);
    try {
      const result = await verifyAdminPinWithServer(pinInput);
      if (!result.ok) {
        setPinError(result.message);
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(PIN_STORAGE_KEY, "1");
        sessionStorage.setItem(ADMIN_API_PIN_SESSION_KEY, pinInput.trim());
      }
      setUnlocked(true);
      setPinInput("");
    } finally {
      setPinSubmitting(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    const supabase = createClient();
    const order = orders.find((o) => o.id === orderId);
    const patch: Record<string, unknown> = { status: newStatus };
    const paidLikeStatuses = new Set(["price_confirmed", "shipping", "delivered", "paid"]);
    if (paidLikeStatuses.has(newStatus) && order && !order.paid_at) {
      patch.paid_at = new Date().toISOString();
    }
    await supabase.from("orders").update(patch).eq("id", orderId);

    if (paidLikeStatuses.has(newStatus) && typeof window !== "undefined") {
      const pin = sessionStorage.getItem(ADMIN_API_PIN_SESSION_KEY);
      if (pin) {
        try {
          await fetch("/api/admin/loyalty/recalculate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...adminApiPinHeaders(pin),
            },
            body: JSON.stringify({ orderId }),
            credentials: "same-origin",
          });
        } catch {
          /* VIP再計算は補助的。失敗しても注文更新は完了済み */
        }
      }
    }

    await fetchOrders();
    setUpdatingId(null);
  }

  async function handleReply(orderId: string) {
    const body = (replyTexts[orderId] ?? "").trim();
    if (!body) return;
    setReplySending(orderId);
    const supabase = createClient();
    await supabase.from("order_messages").insert({ order_id: orderId, sender: "shop", body });
    setReplyTexts((prev) => ({ ...prev, [orderId]: "" }));
    await fetchOrders();
    setReplySending(null);
  }

  async function handleDeleteOrder(orderId: string) {
    if (!confirm("この注文を削除しますか？\nลบคำสั่งซื้อนี้หรือไม่?")) return;
    setDeletingId(orderId);
    const supabase = createClient();
    await supabase.from("order_messages").delete().eq("order_id", orderId);
    await supabase.from("order_items").delete().eq("order_id", orderId);
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    setDeletingId(null);
    if (error) { alert(`削除失敗: ${error.message}`); return; }
    await fetchOrders();
  }

  function toggleExpand(id: string) {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── PINロック画面 ───────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Lock size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">管理者ログイン</h1>
            <p className="text-slate-500 text-sm mt-1">เข้าสู่ระบบจัดการ</p>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 text-xs text-slate-500 leading-relaxed">
            <p>🔑 <strong className="text-slate-700">管理PIN（ADMIN_PIN）</strong> を入力</p>
            <p className="mt-1">Cloudflare Workers の環境変数 <code className="bg-slate-200 rounded px-1">ADMIN_PIN</code> と同じ値です。<br />
            ローカル開発中は <code className="bg-slate-200 rounded px-1">.env.local</code> の <code className="bg-slate-200 rounded px-1">ADMIN_PIN</code> の値を入力してください。</p>
          </div>
          <form onSubmit={(ev) => void handlePinSubmit(ev)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                PIN コード · รหัสผ่าน
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
                placeholder="••••••"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {pinError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center">{pinError}</p>
                <p className="text-red-400 text-xs text-center mt-1">
                  Cloudflare の ADMIN_PIN と同じ値を入力してください
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={pinSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold transition-colors"
            >
              {pinSubmitting ? "確認中…" : "ログイン · เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 統計サマリー ─────────────────────────────────────────────────
  const pendingCount        = orders.filter((o) => normalizeOrderStatus(o.status) === "pending").length;
  const priceConfirmedCount = orders.filter((o) => normalizeOrderStatus(o.status) === "price_confirmed").length;
  const shippingCount       = orders.filter((o) => normalizeOrderStatus(o.status) === "shipping").length;
  const deliveredCount      = orders.filter((o) => normalizeOrderStatus(o.status) === "delivered").length;
  const totalRevenue        = orders.reduce((s, o) => s + (o.total_amount ?? 0), 0);

  // ── メイン画面 ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* ページタイトルバー */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ShoppingBag size={20} className="text-emerald-500" />
              注文一覧
              <span className="text-slate-400 font-normal text-sm ml-1">· รายการออเดอร์</span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              ページ {page + 1} · {orders.length} 件表示
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="メール検索 (order_email)"
              className="w-52 sm:w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => {
                setPage(0);
                setEmailQuery(normalizeEmailQuery(emailInput));
              }}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              検索
            </button>
            <button
              onClick={() => {
                setEmailInput("");
                setPage(0);
                setEmailQuery("");
              }}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
            >
              解除
            </button>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              更新
            </button>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">未確認</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">料金確認</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{priceConfirmedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">配達中</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{shippingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">配達済み</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{deliveredCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm col-span-2 sm:col-span-1 lg:col-span-2">
            <p className="text-xs text-slate-500 font-medium">売上合計 · ยอดรวม</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              ฿{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 size={40} className="animate-spin text-emerald-500 mb-3" />
            <p className="text-sm">読み込み中… · กำลังโหลด</p>
          </div>
        )}

        {/* 注文なし */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <Package size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-500">まだ注文がありません</p>
            <p className="text-slate-400 text-sm mt-1">ยังไม่มีรายการคำสั่งซื้อ</p>
          </div>
        )}

        {/* 注文リスト */}
        {!loading && orders.length > 0 && (
          <>
            <ul className="space-y-3">
              {orders.map((order) => {
              const status = normalizeOrderStatus(order.status);
              const statusCfg = STATUS_CONFIG[status];
              const displayName    = order.user_name || order.shipping_name || "—";
              const displayPhone   = order.user_phone || order.shipping_phone || "—";
              const displayAddress = order.address || order.shipping_address || "—";
              const msgs = (order.order_messages ?? []).sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              const unreadMsgs = msgs.filter((m) => m.sender === "customer").length;
              const isExpanded = expandedOrders.has(order.id);
              const shipping  = order.shipping_fee ?? 0;
              const discount  = order.discount_amount ?? 0;
              const subtotal  = order.total_amount - shipping + discount;

                return (
                  <li key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* ── カードヘッダー ── */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-slate-700">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}
                        >
                          {statusCfg.label} · {statusCfg.labelTh}
                        </span>
                        {unreadMsgs > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadMsgs} msg
                          </span>
                        )}
                        <span className="text-slate-400 text-xs ml-auto">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-700 font-semibold text-sm mt-0.5 truncate">
                        {displayName}
                        <span className="text-slate-400 font-normal ml-2 text-xs">{displayPhone}</span>
                      </p>
                      {(order.order_email || order.order_email_normalized) && (
                        <p className="text-slate-500 text-xs truncate">
                          {order.order_email ?? order.order_email_normalized}
                        </p>
                      )}
                    </div>

                    {/* ステータス変更セレクト */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {updatingId === order.id && <Loader2 size={14} className="animate-spin text-emerald-500" />}
                    </div>

                    {/* 展開・削除 */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                      title="詳細を展開"
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition-colors"
                      title="削除"
                    >
                      {deletingId === order.id
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Trash2 size={16} />}
                    </button>
                  </div>

                  {/* ── 折りたたみ詳細 ── */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* 顧客情報 */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                            <User size={12} /> 顧客 · ลูกค้า
                          </p>
                          <p className="font-semibold text-slate-800">{displayName}</p>
                          <p className="text-slate-500 text-sm">{displayPhone}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                            <MapPin size={12} /> 配送先 · ที่อยู่
                          </p>
                          <p className="text-slate-700 text-sm whitespace-pre-wrap">{displayAddress}</p>
                          {order.order_notes && (
                            <p className="mt-1 text-amber-700 text-xs bg-amber-50 px-2 py-1 rounded-lg">
                              📝 {order.order_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 商品リスト */}
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                          <Package size={12} /> 注文商品 · รายการสินค้า
                        </p>
                        <div className="space-y-1.5">
                          {(order.order_items ?? []).map((item, i) => {
                            const name = item.products?.name_ja || item.products?.name_th || `#${item.product_id.slice(0, 6)}`;
                            const metaSize = item.meta && typeof item.meta.selected_size_g === "number"
                              ? item.meta.selected_size_g : null;
                            const sizeG = metaSize ?? item.products?.weight_g ?? null;
                            const flavorStr = formatMetaFlavors(item.meta);
                            const unitPrice = item.unit_price ?? 0;
                            return (
                              <div key={item.id ?? i} className="flex items-start justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                                <div>
                                  <span className="font-medium text-slate-800">{name}</span>
                                  {sizeG && <span className="ml-1.5 text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">{sizeG}g</span>}
                                  <span className="ml-1.5 text-slate-500">×{item.quantity}</span>
                                  {flavorStr && <p className="text-xs text-orange-500 mt-0.5">{flavorStr}</p>}
                                </div>
                                <span className="font-semibold text-slate-700 tabular-nums ml-3 shrink-0">
                                  ฿{(unitPrice * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 金額内訳 */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        {(shipping > 0 || discount > 0) && (
                          <>
                            <div className="flex justify-between px-4 py-2 text-sm text-slate-500">
                              <span>小計 · Subtotal</span>
                              <span>฿{subtotal.toLocaleString()}</span>
                            </div>
                            {shipping > 0 && (
                              <div className="flex justify-between px-4 py-2 text-sm text-slate-500 border-t border-slate-100">
                                <span className="flex items-center gap-1"><Truck size={13} /> 送料 · Shipping</span>
                                <span>฿{shipping.toLocaleString()}</span>
                              </div>
                            )}
                            {discount > 0 && (
                              <div className="flex justify-between px-4 py-2 text-sm text-emerald-600 border-t border-slate-100">
                                <span className="flex items-center gap-1"><Tag size={13} /> 割引 · Discount</span>
                                <span>-฿{discount.toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex justify-between px-4 py-3 font-bold text-slate-800 bg-slate-50 border-t border-slate-200">
                          <span>合計 · ยอดรวม</span>
                          <span className="text-emerald-700 text-lg">฿{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* スリップ画像 */}
                      {order.slip_image_url && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                            <ImageIcon size={12} /> 振込証明 · หลักฐานการโอน
                          </p>
                          <a
                            href={order.slip_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block w-24 h-24 rounded-xl overflow-hidden border border-emerald-200 hover:opacity-90 transition-opacity"
                          >
                            <Image src={order.slip_image_url} alt="slip" fill className="object-cover" sizes="96px" />
                          </a>
                        </div>
                      )}

                      {/* メッセージ */}
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                          <MessageCircle size={12} /> メッセージ · ข้อความ
                          {unreadMsgs > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {unreadMsgs}
                            </span>
                          )}
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-3">
                          {msgs.length === 0 && (
                            <p className="text-slate-400 text-xs text-center py-3">まだメッセージはありません · ยังไม่มีข้อความ</p>
                          )}
                          {msgs.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-1.5 ${msg.sender === "shop" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.sender === "customer" && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                  <User size={11} className="text-slate-500" />
                                </div>
                              )}
                              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${msg.sender === "shop" ? "bg-emerald-500 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
                                <p className="whitespace-pre-wrap">{msg.body}</p>
                                <p className={`text-[9px] mt-1 ${msg.sender === "shop" ? "text-white/60" : "text-slate-400"}`}>
                                  {new Date(msg.created_at).toLocaleString("th-TH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              {msg.sender === "shop" && (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                  <Store size={11} className="text-emerald-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* 返信フォーム */}
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleReply(order.id); }}
                          className="mt-2 flex gap-2"
                        >
                          <input
                            type="text"
                            value={replyTexts[order.id] ?? ""}
                            onChange={(e) => setReplyTexts((prev) => ({ ...prev, [order.id]: e.target.value }))}
                            placeholder="返信 · ตอบกลับ…"
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none bg-white"
                          />
                          <button
                            type="submit"
                            disabled={replySending === order.id || !(replyTexts[order.id] ?? "").trim()}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 flex items-center gap-1 transition-colors"
                          >
                            {replySending === order.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={loading || page === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <span className="text-xs text-slate-500">Page {page + 1}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || !hasNextPage}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
