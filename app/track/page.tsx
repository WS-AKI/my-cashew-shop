"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { Search, Package, CreditCard, Truck, Clock, AlertCircle } from "lucide-react";

const STEPS = [
  {
    key: "pending",
    label: { ja: "注文受付", th: "รับออเดอร์แล้ว" },
    icon: Package,
  },
  {
    key: "paid",
    label: { ja: "お支払い確認済", th: "ชำระเงินแล้ว" },
    icon: CreditCard,
  },
  {
    key: "shipped",
    label: { ja: "発送完了", th: "จัดส่งแล้ว" },
    icon: Truck,
  },
] as const;

type OrderResult = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
};

function statusIndex(status: string): number {
  const idx = STEPS.findIndex((s) => s.key === status.toLowerCase());
  return idx === -1 ? 0 : idx;
}

export default function TrackPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    try {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("id", trimmed)
        .maybeSingle();

      if (dbErr) throw dbErr;
      if (!data) {
        setError("注文が見つかりませんでした。注文番号をご確認ください。\nไม่พบคำสั่งซื้อ กรุณาตรวจสอบหมายเลขคำสั่งซื้อ");
        return;
      }
      setOrder(data);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。\nเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  const activeIdx = order ? statusIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-amber-950 mb-1">
            <DualLanguageLabel primary="注文状況を確認" secondary="ตรวจสอบสถานะคำสั่งซื้อ" />
          </h1>
          <p className="text-gray-500 text-sm">
            <DualLanguageLabel
              primary="注文完了時に表示された注文番号を入力してください"
              secondary="กรอกหมายเลขคำสั่งซื้อที่แสดงตอนสั่งซื้อเสร็จ"
            />
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="注文番号 / Order ID"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            {loading ? (
              <Clock size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            確認
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            {/* Progress steps */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between relative">
                {/* Connector line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200" />
                <div
                  className="absolute top-5 left-[10%] h-0.5 bg-amber-500 transition-all duration-500"
                  style={{ width: `${activeIdx * 40}%` }}
                />

                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= activeIdx;
                  const current = i === activeIdx;
                  return (
                    <div key={step.key} className="relative flex flex-col items-center z-10 w-1/3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          done
                            ? current
                              ? "bg-amber-500 text-white ring-4 ring-amber-200 scale-110"
                              : "bg-amber-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <p
                        className={`mt-2 text-xs font-bold text-center leading-tight ${
                          done ? "text-amber-700" : "text-gray-400"
                        }`}
                      >
                        {step.label.ja}
                      </p>
                      <p
                        className={`text-[10px] text-center leading-tight ${
                          done ? "text-amber-500" : "text-gray-300"
                        }`}
                      >
                        {step.label.th}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order details */}
            <div className="border-t border-amber-100 px-6 py-4 space-y-2 bg-amber-50/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  <DualLanguageLabel primary="注文日" secondary="วันที่สั่ง" />
                </span>
                <span className="text-gray-800 font-medium">
                  {new Date(order.created_at).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  <DualLanguageLabel primary="合計" secondary="ยอดรวม" />
                </span>
                <span className="text-amber-700 font-bold text-base">
                  ฿{order.total_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  <DualLanguageLabel primary="注文番号" secondary="เลขที่" />
                </span>
                <span className="text-gray-600 text-xs font-mono break-all">
                  {order.id}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && !order && !error && (
          <div className="text-center text-gray-400 py-8">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">注文が見つかりませんでした</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
