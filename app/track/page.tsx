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
  Search, Package, Clock, AlertCircle,
  Upload, CheckCircle, Loader2, Send, MessageCircle, User, Store, Copy, Check, Clock3,
} from "lucide-react";
import { useAudience } from "@/context/AudienceContext";
import { useLanguage } from "@/context/LanguageContext";
import OrderProgressBar from "@/components/orders/OrderProgressBar";
import { normalizeOrderLookupRef, resolveOrderRowForLookup } from "@/lib/order-lookup";

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
  const audience = useAudience();
  const { language, t: tLang } = useLanguage();
  const isEn = language === "en";
  const tr = tLang.track;
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
  const [copied, setCopied] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);
  const [slipAmountInput, setSlipAmountInput] = useState("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [slipOcrDone, setSlipOcrDone] = useState(false);
  const isMountedRef = useRef(true);
  const ocrRunIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      ocrRunIdRef.current += 1;
    };
  }, []);

  async function fetchOrder(rawInput: string) {
    setLoading(true);
    setError(null);
    setOrder(null);
    setMessages([]);
    setSearched(true);
    setSlipUploaded(false);
    setSlipFile(null);
    setSlipPreview(null);
    setSlipAmountInput("");
    setSlipOcrDone(false);
    setIsOcrRunning(false);

    const norm = normalizeOrderLookupRef(rawInput);
    if (norm.kind === "invalid") {
      setError(
        isEn
          ? tr.errorInvalidFormat
          : "注文番号の形式が正しくありません。表示されている番号をそのまま（または # 付き・先頭8桁）で入力してください。\nรูปแบบหมายเลขไม่ถูกต้อง กรุณาคัดลอกจากอีเมลหรือหน้าสั่งซื้อ",
      );
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const resolved = await resolveOrderRowForLookup(supabase, norm);

      if (!resolved.ok) {
        if (resolved.reason === "not_found") {
          setError(isEn ? tr.errorNotFound : "注文が見つかりませんでした。注文番号をご確認ください。\nไม่พบคำสั่งซื้อ กรุณาตรวจสอบหมายเลขคำสั่งซื้อ");
          return;
        }
        if (resolved.reason === "ambiguous") {
          setError(
            isEn
              ? tr.errorAmbiguous
              : "同じ先頭番号に複数の注文が見つかりました。注文完了メールなどに記載の完全な注文番号（UUID）で検索してください。\nพบหลายคำสั่งซื้อที่ตรงกัน กรุณาใช้หมายเลขเต็มจากอีเมล",
          );
          return;
        }
        if (process.env.NODE_ENV === "development" && resolved.details) {
          console.error("resolveOrderRowForLookup", resolved.details);
        }
        setError(isEn ? tr.errorGeneric : "エラーが発生しました。もう一度お試しください。\nเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        return;
      }

      const row = resolved.row;
      setOrder(row);

      const { data: msgs } = await supabase
        .from("order_messages")
        .select("id, sender, body, created_at")
        .eq("order_id", row.id)
        .order("created_at", { ascending: true });
      setMessages((msgs as Message[]) ?? []);
    } catch (e) {
      console.error("fetchOrder", e);
      setError(isEn ? tr.errorGeneric : "エラーが発生しました。もう一度お試しください。\nเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
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
    ocrRunIdRef.current += 1;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setSlipError(null);
    setSlipUploaded(false);
    setSlipOcrDone(false);
    setSlipAmountInput("");
    setIsOcrRunning(false);
  }

  async function tryReadAmountFromSlipImage(file: File, orderTotalBaht: number | null): Promise<number | null> {
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const text = data.text || "";
      const matches = text.match(/\d[\d,.]*/g) || [];
      const numbers: number[] = [];
      for (const m of matches) {
        const n = Math.round(parseFloat(m.replace(/,/g, "")));
        if (Number.isFinite(n) && n >= 1 && n <= 9999999) numbers.push(n);
      }
      if (numbers.length === 0) return null;
      if (orderTotalBaht != null) {
        const closest = numbers.reduce((a, b) =>
          Math.abs(a - orderTotalBaht) <= Math.abs(b - orderTotalBaht) ? a : b
        );
        return closest;
      }
      return Math.max(...numbers);
    } catch {
      return null;
    }
  }

  async function prepareImageForOcr(file: File): Promise<File> {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1200,
      maxSizeMB: 1,
      initialQuality: 0.88,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
    if (compressed instanceof File) return compressed;
    return new File([compressed], `${file.name.replace(/\.[^.]+$/, "")}-ocr.jpg`, {
      type: "image/jpeg",
    });
  }

  async function handleRunSlipOcr() {
    if (!slipFile || isOcrRunning) return;
    const runId = ocrRunIdRef.current + 1;
    ocrRunIdRef.current = runId;
    const targetFile = slipFile;
    setIsOcrRunning(true);
    setSlipOcrDone(false);
    setSlipError(null);
    try {
      const optimized = await prepareImageForOcr(targetFile);
      if (!isMountedRef.current || runId !== ocrRunIdRef.current) return;
      const amount = await tryReadAmountFromSlipImage(optimized, order?.total_amount ?? null);
      if (!isMountedRef.current || runId !== ocrRunIdRef.current) return;
      if (amount != null) {
        setSlipAmountInput(String(amount));
        setSlipOcrDone(true);
      } else {
        setSlipError(isEn ? "Could not read amount. Please enter manually." : "金額を読み取れませんでした。手動で入力してください。\nไม่สามารถอ่านจำนวนเงินได้ กรุณากรอกด้วยตนเอง");
      }
    } catch {
      if (!isMountedRef.current || runId !== ocrRunIdRef.current) return;
      setSlipError(isEn ? "OCR failed. Please enter the amount manually." : "OCRの読み取りに失敗しました。手動で入力してください。\nOCR ล้มเหลว กรุณากรอกด้วยตนเอง");
    } finally {
      if (!isMountedRef.current || runId !== ocrRunIdRef.current) return;
      setIsOcrRunning(false);
    }
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

  const hasSlip = !!(order?.slip_image_url);
  const lineTemplate = order
    ? `注文番号: ${order.id}\n問い合わせ内容: `
    : "注文番号: \n問い合わせ内容: ";

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-amber-950 mb-1">
            {isEn ? tr.pageTitle : <DualLanguageLabel primary="注文状況を確認" secondary="ตรวจสอบสถานะคำสั่งซื้อ" />}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEn ? tr.pageSub : (
              <DualLanguageLabel
                primary="注文番号を入力してください"
                secondary="กรอกหมายเลขคำสั่งซื้อ"
              />
            )}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isEn ? tr.searchPlaceholder : "注文番号（#付き・先頭8桁可）/ Order ID"}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 shadow-sm"
          >
            {loading ? <Clock size={18} className="animate-spin" /> : <Search size={18} />}
            {tr.searchButton}
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
                    <p className="text-orange-700 font-bold text-sm">
                      {isEn ? tr.slipPendingTitle : "お支払いスリップが未提出です"}
                    </p>
                    {!isEn && <p className="text-orange-500 text-xs mt-0.5">ยังไม่ได้อัพโหลดสลิปการโอนเงิน</p>}
                    <p className="text-orange-600 text-xs mt-1">
                      {isEn ? tr.slipPendingLineFallback : "難しい場合は、公式LINEに「注文番号＋スリップ写真」を送ってください。"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(lineTemplate, "lineTemplate")}
                  className="w-full py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {copied === "lineTemplate" ? <Check size={15} /> : <Copy size={15} />}
                  {copied === "lineTemplate" ? "Copied" : tr.slipCopyLine}
                </button>
                {slipError && <p className="text-red-600 text-sm">{slipError}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEn ? tr.amountLabel : "金額（任意）/ จำนวนเงิน (ไม่บังคับ)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="例: 150"
                    value={slipAmountInput}
                    onChange={(e) => {
                      setSlipAmountInput(e.target.value);
                      setSlipOcrDone(false);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleRunSlipOcr}
                    disabled={!slipFile || isOcrRunning}
                    className="mt-2 w-full rounded-xl bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2.5 text-sm font-semibold hover:bg-amber-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {isOcrRunning ? (
                      <>
                        <Loader2 size={16} className="animate-spin flex-shrink-0" />
                        {tr.slipOcrRunning}
                      </>
                    ) : (
                      tr.slipOcrButton
                    )}
                  </button>
                  {slipOcrDone && slipAmountInput !== "" && (
                    <p className="mt-1.5 text-gray-600 text-xs">
                      {tr.slipOcrDoneHint}
                    </p>
                  )}
                </div>
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
                    {isEn ? tr.slipSelectButton : "スリップをアップロード / อัพโหลดสลิป"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSlipUpload}
                    disabled={slipUploading}
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {slipUploading
                      ? <><Loader2 size={18} className="animate-spin" /> {tr.slipUploading}</>
                      : <><Upload size={18} /> {tr.slipUploadButton}</>
                    }
                  </button>
                )}
              </section>
            )}
            {slipUploaded && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 border border-green-200 rounded-xl p-3">
                  <CheckCircle size={18} />
                  {isEn ? tr.slipUploadDone : "スリップをアップロードしました"}
                  {!isEn && <span className="text-green-500 text-xs">(อัพโหลดเรียบร้อย)</span>}
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 flex items-start gap-2">
                  <Clock3 size={16} className="text-amber-700 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    {isEn ? tr.uploadEta : "ご入金確認は通常24〜48時間以内（営業日）に行います。確認後、順次発送いたします。"}
                    {!isEn && (
                      <span className="block text-amber-700/80 mt-0.5" lang="th">
                        โดยปกติยืนยันการชำระเงินภายใน 24–48 ชั่วโมง (วันทำการ) และจัดส่งตามลำดับ
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="p-4">
                <OrderProgressBar status={order.status} language={audience} />
              </div>
              <div className="border-t border-amber-100 px-6 py-4 space-y-2 bg-amber-50/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {isEn ? tr.orderDateLabel : <DualLanguageLabel primary="注文日" secondary="วันที่สั่ง" />}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {new Date(order.created_at).toLocaleDateString(isEn ? "en-US" : "ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {isEn ? tr.orderTotalLabel : <DualLanguageLabel primary="合計" secondary="ยอดรวม" />}
                  </span>
                  <span className="text-amber-700 font-bold text-base">฿{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <MessageCircle size={18} className="text-white" />
                <span className="text-white font-bold text-sm">
                  {isEn ? tr.messagesHeading : "メッセージ"}
                  {!isEn && <span className="text-white/70 text-xs ml-1">(ข้อความ)</span>}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {isEn ? tr.noMessages : "メッセージはまだありません"}
                    {!isEn && <><br /><span className="text-xs">ยังไม่มีข้อความ</span></>}
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
                  placeholder={isEn ? tr.messagePlaceholder : "メッセージを入力... / พิมพ์ข้อความ..."}
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
            <p className="text-sm">{tr.notFound}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
