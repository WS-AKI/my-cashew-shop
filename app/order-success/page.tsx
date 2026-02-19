"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ChevronRight, Copy, Check, Building2, Upload, Loader2, FileText, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { SHOP_TEXT, BANK_INFO } from "@/lib/shop-config";

const T = SHOP_TEXT.orderSuccess;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    return true;
  }
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "";

  const [copied, setCopied] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipUploading, setSlipUploading] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setSlipError(null);
    setSlipUploaded(false);
  }

  async function handleSlipUpload() {
    if (!slipFile || !orderId) return;
    setSlipUploading(true);
    setSlipError(null);
    const supabase = createClient();
    try {
      const compressed = await imageCompression(slipFile, {
        maxWidthOrHeight: 1024,
        maxSizeMB: 0.3,
        useWebWorker: true,
      });
      const ext = compressed.name.split(".").pop() ?? "jpg";
      const path = `slips/${orderId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("slips").upload(path, compressed);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("slips").getPublicUrl(path);
      const { error: updateErr } = await supabase
        .from("orders")
        .update({ slip_image_url: urlData.publicUrl })
        .eq("id", orderId);
      if (updateErr) throw updateErr;
      setSlipUploaded(true);
      setSlipPreview(urlData.publicUrl);
      fetch("/api/notify-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      }).catch(() => {});
    } catch (err) {
      setSlipError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSlipUploading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (slipPreview && slipPreview.startsWith("blob:")) URL.revokeObjectURL(slipPreview);
    };
  }, [slipPreview]);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        {/* Success header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-amber-950 mb-2">
            <DualLanguageLabel primary={T.title.ja} secondary={T.title.th} />
          </h1>
          <p className="text-gray-600 text-sm">
            <DualLanguageLabel primary={T.thankYou.ja} secondary={T.thankYou.th} />
          </p>
        </div>

        {/* Order number display */}
        {orderId && (
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
              <FileText size={20} className="text-white" />
              <span className="text-white font-bold">
                注文番号
                <span className="block text-white/70 text-xs font-normal">หมายเลขคำสั่งซื้อ</span>
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">
                この番号を控えてください。注文状況の確認に必要です。
              </p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <code className="flex-1 text-sm font-mono text-gray-800 break-all select-all">
                  {orderId}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(orderId, "orderId")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium shrink-0"
                >
                  {copied === "orderId" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "orderId" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Bank info */}
        <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="bg-amber-500 px-4 py-3 flex items-center gap-2">
            <Building2 size={20} className="text-white" />
            <span className="text-white font-bold">
              <DualLanguageLabel primary={T.paymentMethod.ja} secondary={T.paymentMethod.th} className="text-white" secondaryClassName="text-white/80 text-xs" />
            </span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-amber-800 text-sm font-medium">
              <DualLanguageLabel primary={T.notePayment.ja} secondary={T.notePayment.th} />
            </p>
            <div className="border-t border-amber-100 pt-4 space-y-3">
              <div>
                <p className="text-gray-400 text-xs font-medium">
                  <DualLanguageLabel primary={T.bankName.ja} secondary={T.bankName.th} />
                </p>
                <p className="text-gray-800 font-bold mt-0.5">{BANK_INFO.bankName}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    <DualLanguageLabel primary={T.accountName.ja} secondary={T.accountName.th} />
                  </p>
                  <p className="text-gray-800 font-bold mt-0.5">{BANK_INFO.accountName}</p>
                  {"accountNameTH" in BANK_INFO && (
                    <p className="text-gray-500 text-sm mt-0.5" lang="th">
                      {BANK_INFO.accountNameTH}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(BANK_INFO.accountName, "name")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium shrink-0"
                >
                  {copied === "name" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "name" ? T.copied.ja : T.copy.ja}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    <DualLanguageLabel primary={T.accountNumber.ja} secondary={T.accountNumber.th} />
                  </p>
                  <p className="text-gray-800 font-bold text-lg tracking-wider mt-0.5">{BANK_INFO.accountNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(BANK_INFO.accountNumber, "number")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium shrink-0"
                >
                  {copied === "number" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "number" ? T.copied.ja : T.copy.ja}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Slip upload — mandatory */}
        {orderId && (
          <section className="bg-white rounded-2xl shadow-sm border-2 border-orange-300 overflow-hidden">
            <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
              <Upload size={20} className="text-white" />
              <span className="text-white font-bold">
                お支払いスリップのアップロード
                <span className="block text-white/80 text-xs font-normal">อัพโหลดสลิปโอนเงิน (จำเป็น)</span>
              </span>
            </div>
            <div className="p-4 space-y-4">
              {!slipUploaded && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <p className="text-orange-700 text-sm font-medium">
                    お振込後、スリップ（振込証明）をアップロードしてください。
                  </p>
                  <p className="text-orange-500 text-xs mt-1">
                    กรุณาอัพโหลดสลิปหลังโอนเงิน เพื่อยืนยันการชำระเงิน
                  </p>
                </div>
              )}

              {slipError && (
                <p className="text-red-600 text-sm">{slipError}</p>
              )}

              {slipUploaded ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle size={20} />
                    アップロード完了
                    <span className="text-green-500 text-xs">(อัพโหลดเรียบร้อย)</span>
                  </div>
                  {slipPreview && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <Image src={slipPreview} alt="Slip" fill className="object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {slipPreview && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={slipPreview}
                        alt="Slip preview"
                        fill
                        className="object-contain"
                        unoptimized={slipPreview.startsWith("blob:")}
                      />
                    </div>
                  )}
                  <input
                    ref={slipInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSlipChange}
                    className="hidden"
                  />
                  {!slipFile ? (
                    <button
                      type="button"
                      onClick={() => slipInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-medium flex items-center justify-center gap-2"
                    >
                      <Upload size={20} />
                      スリップを選択 / เลือกสลิป
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSlipUpload}
                      disabled={slipUploading}
                      className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {slipUploading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          アップロード中...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          アップロードする
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Post-upload actions or waiting message */}
        {slipUploaded ? (
          <div className="space-y-4">
            <Link
              href={`/track?id=${orderId}`}
              className="block w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-center flex items-center justify-center gap-2"
            >
              <Search size={18} />
              注文状況を確認する
              <span className="text-white/70 text-xs">(ตรวจสอบสถานะ)</span>
            </Link>
            <Link
              href="/#products"
              className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center flex items-center justify-center gap-2"
            >
              {T.continueShopping.ja}
              <span className="text-white/80 text-xs">({T.continueShopping.th})</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          !orderId && (
            <div className="text-center">
              <Link
                href="/#products"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
              >
                {T.continueShopping.ja}
                <span className="text-white/80 text-xs ml-1">({T.continueShopping.th})</span>
                <ChevronRight size={18} />
              </Link>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
