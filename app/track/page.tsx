"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import {
  Search, Package, CreditCard, Truck, Clock, AlertCircle,
  Upload, CheckCircle, Loader2, Send, MessageCircle, User, Store,
} from "lucide-react";

const STEPS = [
  { key: "pending",         label: { ja: "注文受付",   th: "รับออเดอร์แล้ว" }, icon: Package      },
  { key: "price_confirmed", label: { ja: "料金確認",   th: "ยืนยันค่าจัดส่ง" }, icon: CreditCard   },
  { key: "shipping",        label: { ja: "配達中",     th: "กำลังจัดส่ง"     }, icon: Truck        },
  { key: "delivered",       label: { ja: "配達済み",   th: "จัดส่งแล้ว"      }, icon: CheckCircle  },
] as const;

type OrderResult = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  slip_image_url?: string | null;
};

type Message = {
  id: string;
  sender: "customer" | "shop";
  body: string;
  created_at: string;
};

function normalizeStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower === "paid") return "price_confirmed";
  if (lower === "shipped") return "shipping";
  return lower;
}

function statusIndex(status: string): number {
  const normalized = normalizeStatus(status);
  const idx = STEPS.findIndex((s) => s.key === normalized);
  return idx === -1 ? 0 : idx;
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") ?? "";

  const [input, setInput] = useState(initialId);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipUploading, setSlipUploading] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  async function fetchOrder(orderId: string) {
    setLoading(true);
    setError(null);
    setOrder(null);
    setMessages([]);
    setSearched(true);
    setSlipUploaded(false);
    setSlipFile(null);
    setSlipPreview(null);

    try {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at, slip_image_url")
        .eq("id", orderId)
        .maybeSingle();

      if (dbErr) throw dbErr;
      if (!data) {
        setError("注文が見つかりませんでした。注文番号をご確認ください。\nไม่พบคำสั่งซื้อ กรุณาตรวจสอบหมายเลขคำสั่งซื้อ");
        return;
      }
      setOrder(data);

      const { data: msgs } = await supabase
        .from("order_messages")
        .select("id, sender, body, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      setMessages((msgs as Message[]) ?? []);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。\nเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) fetchOrder(trimmed);
  }

  useEffect(() => {
    if (initialId) fetchOrder(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim() || !order) return;
    setMsgSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, sender: "customer", body: msgText.trim() }),
      });
      if (!res.ok) throw new Error("Send failed");
      const saved = await res.json();
      setMessages((prev) => [...prev, saved]);
      setMsgText("");
    } catch {
      /* silent */
    } finally {
      setMsgSending(false);
    }
  }

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setSlipError(null);
    setSlipUploaded(false);
  }

  async function handleSlipUpload() {
    if (!slipFile || !order) return;
    setSlipUploading(true);
    setSlipError(null);
    const supabase = createClient();
    try {
      const compressed = await imageCompression(slipFile, {
        maxWidthOrHeight: 1024,
        maxSizeMB: 0.3,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const path = `slips/${order.id}-${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage.from("slips").upload(path, compressed, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (uploadErr) throw new Error(`アップロード: ${uploadErr.message}`);
      const { data: urlData } = supabase.storage.from("slips").getPublicUrl(path);
      const { error: updateErr } = await supabase
        .from("orders")
        .update({ slip_image_url: urlData.publicUrl })
        .eq("id", order.id);
      if (updateErr) throw new Error(`注文の更新: ${updateErr.message}`);
      setSlipUploaded(true);
      setOrder({ ...order, slip_image_url: urlData.publicUrl });
      fetch("/api/notify-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      }).catch(() => {});
    } catch (err) {
      setSlipError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setSlipUploading(false);
    }
  }

  const activeIdx = order ? statusIndex(order.status) : -1;
  const hasSlip = !!(order?.slip_image_url);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-amber-950 mb-1">
            <DualLanguageLabel primary="注文状況を確認" secondary="ตรวจสอบสถานะคำสั่งซื้อ" />
          </h1>
          <p className="text-gray-500 text-sm">
            <DualLanguageLabel
              primary="注文番号を入力してください"
              secondary="กรอกหมายเลขคำสั่งซื้อ"
            />
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="注文番号 / Order ID"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 shadow-sm"
          >
            {loading ? <Clock size={18} className="animate-spin" /> : <Search size={18} />}
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

        {order && (
          <>
            {/* Slip reminder */}
            {!hasSlip && !slipUploaded && (
              <section className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-700 font-bold text-sm">お支払いスリップが未提出です</p>
                    <p className="text-orange-500 text-xs mt-0.5">ยังไม่ได้อัพโหลดสลิปการโอนเงิน</p>
                  </div>
                </div>
                {slipError && <p className="text-red-600 text-sm">{slipError}</p>}
                {slipPreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <Image src={slipPreview} alt="Preview" fill className="object-contain" unoptimized />
                  </div>
                )}
                <input ref={slipInputRef} type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                {!slipFile ? (
                  <button
                    type="button"
                    onClick={() => slipInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-medium flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    スリップをアップロード / อัพโหลดสลิป
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSlipUpload}
                    disabled={slipUploading}
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {slipUploading ? <><Loader2 size={18} className="animate-spin" /> アップロード中...</> : <><Upload size={18} /> アップロードする</>}
                  </button>
                )}
              </section>
            )}
            {slipUploaded && (
              <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 border border-green-200 rounded-xl p-3">
                <CheckCircle size={18} />
                スリップをアップロードしました
                <span className="text-green-500 text-xs">(อัพโหลดเรียบร้อย)</span>
              </div>
            )}

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-[6%] right-[6%] h-0.5 bg-gray-200" />
                  <div
                    className="absolute top-5 left-[6%] h-0.5 bg-amber-500 transition-all duration-500"
                    style={{ width: `${activeIdx * ((100 - 12) / (STEPS.length - 1))}%` }}
                  />
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= activeIdx;
                    const current = i === activeIdx;
                    return (
                      <div key={step.key} className="relative flex flex-col items-center z-10 w-1/4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${done ? current ? "bg-amber-500 text-white ring-4 ring-amber-200 scale-110" : "bg-amber-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                          <Icon size={18} />
                        </div>
                        <p className={`mt-2 text-xs font-bold text-center leading-tight ${done ? "text-amber-700" : "text-gray-400"}`}>{step.label.ja}</p>
                        <p className={`text-[10px] text-center leading-tight ${done ? "text-amber-500" : "text-gray-300"}`}>{step.label.th}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-amber-100 px-6 py-4 space-y-2 bg-amber-50/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500"><DualLanguageLabel primary="注文日" secondary="วันที่สั่ง" /></span>
                  <span className="text-gray-800 font-medium">
                    {new Date(order.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500"><DualLanguageLabel primary="合計" secondary="ยอดรวม" /></span>
                  <span className="text-amber-700 font-bold text-base">฿{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <MessageCircle size={18} className="text-white" />
                <span className="text-white font-bold text-sm">
                  メッセージ
                  <span className="text-white/70 text-xs ml-1">(ข้อความ)</span>
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    メッセージはまだありません
                    <br />
                    <span className="text-xs">ยังไม่มีข้อความ</span>
                  </p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "shop" && (
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Store size={14} className="text-amber-600" />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${msg.sender === "customer" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === "customer" ? "text-white/60" : "text-gray-400"}`}>
                        {new Date(msg.created_at).toLocaleString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {msg.sender === "customer" && (
                      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="メッセージを入力... / พิมพ์ข้อความ..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={msgSending || !msgText.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm disabled:opacity-50 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  {msgSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </section>
          </>
        )}

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
