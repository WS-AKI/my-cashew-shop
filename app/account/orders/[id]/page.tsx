"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAudience } from "@/context/AudienceContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import OrderProgressBar from "@/components/orders/OrderProgressBar";

type OrderDetail = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_email_normalized: string | null;
};

const COPY = {
  ja: {
    title: "注文詳細",
    backList: "注文履歴に戻る",
    login: "ログインが必要です",
    forbidden: "この注文を表示する権限がありません。",
    notFound: "注文が見つかりませんでした。",
    loadError: "読み込みに失敗しました。",
    orderId: "注文番号",
    trackFull: "メッセージ・スリップはこちら",
    signInLink: "ログイン",
  },
  th: {
    title: "รายละเอียดคำสั่งซื้อ",
    backList: "กลับไปประวัติ",
    login: "ต้องเข้าสู่ระบบ",
    forbidden: "คุณไม่มีสิทธิ์ดูคำสั่งซื้อนี้",
    notFound: "ไม่พบคำสั่งซื้อ",
    loadError: "โหลดไม่สำเร็จ",
    orderId: "หมายเลขคำสั่งซื้อ",
    trackFull: "ข้อความและสลิป",
    signInLink: "เข้าสู่ระบบ",
  },
} as const;

export default function AccountOrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const audience = useAudience();
  const t = COPY[audience];
  const auth = useAuthSessionOptional();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error" | "forbidden" | "notfound" | "auth">("loading");

  useEffect(() => {
    if (!id) {
      setState("notfound");
      return;
    }
    if (!auth?.user?.email) {
      setState("auth");
      return;
    }
    let cancelled = false;
    const myEmail = auth.user.email.trim().toLowerCase();
    void (async () => {
      setState("loading");
      try {
        const res = await fetch(`/api/account/orders/${id}`, { credentials: "same-origin" });
        if (cancelled) return;
        if (res.status === 401) { setState("auth"); return; }
        if (res.status === 403) { setState("forbidden"); return; }
        if (res.status === 404) { setState("notfound"); return; }
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json() as { order?: OrderDetail };
        if (!json.order) { setState("notfound"); return; }
        setOrder(json.order);
        setState("ok");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, auth?.user?.email]);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <Link
          href="/account/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-amber-800/80 hover:text-amber-950"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.backList}
        </Link>

        {state === "loading" ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : state === "auth" ? (
          <p className="text-center text-amber-900">
            {t.login}{" "}
            <Link href="/login" className="font-semibold text-amber-700 underline underline-offset-2">
              {t.signInLink}
            </Link>
          </p>
        ) : state === "forbidden" ? (
          <p className="text-center text-red-700">{t.forbidden}</p>
        ) : state === "notfound" ? (
          <p className="text-center text-amber-800">{t.notFound}</p>
        ) : state === "error" ? (
          <p className="text-center text-red-600">{t.loadError}</p>
        ) : order ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-6 w-6 text-amber-700" />
              <h1 className="text-2xl font-semibold text-amber-950">{t.title}</h1>
            </div>
            <section className="mb-4 rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-sm">
              <p className="text-xs text-amber-800/55">{t.orderId}</p>
              <p className="break-all font-mono text-sm text-amber-950">{order.id}</p>
              <p className="mt-2 text-lg font-bold text-amber-800">฿{Number(order.total_amount).toLocaleString()}</p>
            </section>
            <OrderProgressBar status={order.status} language={audience} />
            <div className="mt-6 text-center">
              <Link
                href={`/track?id=${order.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                {t.trackFull}
              </Link>
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
