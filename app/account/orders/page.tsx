"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Package, UserRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAudience } from "@/context/AudienceContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import OrderProgressBar from "@/components/orders/OrderProgressBar";

type OrderRow = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
};

const COPY = {
  ja: {
    title: "注文履歴",
    subtitle: "マイページ",
    loginHint: "注文一覧を表示するには、会員ログインしてください（注文時のメールアドレスと同じアカウント）。",
    loginCta: "ログインへ",
    trackCta: "注文番号で確認",
    empty: "まだ表示できる注文がありません。",
    emptyHint: "ゲスト購入の場合は、注文完了メールの番号から「注文状況の確認」でご確認ください。",
    date: "注文日",
    total: "合計",
    detail: "詳細",
    loadError: "読み込みに失敗しました。しばらくしてから再度お試しください。",
  },
  th: {
    title: "ประวัติคำสั่งซื้อ",
    subtitle: "บัญชีของฉัน",
    loginHint: "เข้าสู่ระบบสมาชิกเพื่อดูรายการคำสั่งซื้อ (อีเมลเดียวกับตอนสั่งซื้อ)",
    loginCta: "ไปเข้าสู่ระบบ",
    trackCta: "ตรวจสอบด้วยหมายเลขคำสั่งซื้อ",
    empty: "ยังไม่มีคำสั่งซื้อที่แสดงได้",
    emptyHint: "หากสั่งแบบไม่ล็อกอิน กรุณาใช้หมายเลขจากอีเมลที่หน้าติดตามคำสั่งซื้อ",
    date: "วันที่สั่ง",
    total: "ยอดรวม",
    detail: "รายละเอียด",
    loadError: "โหลดไม่สำเร็จ กรุณาลองใหม่ภายหลัง",
  },
} as const;

export default function AccountOrdersPage() {
  const audience = useAudience();
  const t = COPY[audience];
  const auth = useAuthSessionOptional();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.user?.email) {
      setOrders(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/account/orders", { credentials: "same-origin" });
        if (cancelled) return;
        if (res.status === 401) {
          setOrders(null);
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json() as { orders?: OrderRow[] };
        setOrders(json.orders ?? []);
      } catch {
        if (!cancelled) setError(COPY[audience].loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.user?.email, audience]);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <Link
          href="/account"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-amber-800/80 hover:text-amber-950"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.subtitle}
        </Link>

        <div className="mb-6 flex items-center gap-2">
          <Package className="h-6 w-6 text-amber-700" />
          <h1 className="text-2xl font-semibold text-amber-950">{t.title}</h1>
        </div>

        {!auth?.user ? (
          <section className="rounded-2xl border border-amber-200/80 bg-white/90 p-6 shadow-sm">
            <div className="flex gap-3">
              <UserRound className="h-10 w-10 shrink-0 text-amber-600" />
              <div className="space-y-3">
                <p className="text-sm text-amber-950/90">{t.loginHint}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    {t.loginCta}
                  </Link>
                  <Link
                    href="/track"
                    className="inline-flex items-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                  >
                    {t.trackCta}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : orders?.length === 0 ? (
          <section className="rounded-2xl border border-amber-200/80 bg-white/90 p-6 text-center shadow-sm">
            <p className="font-medium text-amber-950">{t.empty}</p>
            <p className="mt-2 text-sm text-amber-900/60">{t.emptyHint}</p>
            <Link href="/track" className="mt-4 inline-block text-sm font-semibold text-amber-700 underline-offset-4 hover:underline">
              {t.trackCta}
            </Link>
          </section>
        ) : (
          <ul className="space-y-5">
            {orders?.map((o) => (
              <li key={o.id} className="rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-amber-800/55">{t.date}</p>
                    <p className="text-sm font-medium text-amber-950">
                      {new Date(o.created_at).toLocaleString(audience === "ja" ? "ja-JP" : "th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-800/55">{t.total}</p>
                    <p className="text-lg font-bold text-amber-800">฿{Number(o.total_amount).toLocaleString()}</p>
                  </div>
                </div>
                <OrderProgressBar status={o.status} language={audience} compact />
                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-amber-100 pt-3">
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-950"
                  >
                    {t.detail}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/track?id=${o.id}`}
                    className="inline-flex items-center gap-1 text-sm text-amber-700/90 underline-offset-4 hover:underline"
                  >
                    {t.trackCta}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
