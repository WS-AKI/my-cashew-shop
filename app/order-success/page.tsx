"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ChevronRight, Copy, Check, Building2, QrCode, Upload, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { SHOP_TEXT, BANK_INFO } from "@/lib/shop-config";

const T = SHOP_TEXT.orderSuccess;
const SLIP_UPLOAD_LABEL_JA = "Upload Payment Slip";
const SLIP_UPLOAD_LABEL_TH = "อัพโหลดสลิปโอนเงิน";

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
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-8">
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

        {BANK_INFO.promptPayQrPath && (
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-amber-500 px-4 py-3 flex items-center gap-2">
              <QrCode size={20} className="text-white" />
              <span className="text-white font-bold">
                <DualLanguageLabel primary={T.promptPay.ja} secondary={T.promptPay.th} className="text-white" secondaryClassName="text-white/80 text-xs" />
              </span>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-56 h-56 rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={BANK_INFO.promptPayQrPath}
                  alt="PromptPay QR Code"
                  fill
                  className="object-contain"
                  sizes="224px"
                />
              </div>
              {"accountNameTH" in BANK_INFO && (
                <p className="text-gray-600 text-sm mt-3 font-medium" lang="th">
                  {BANK_INFO.accountNameTH}
                </p>
              )}
            </div>
          </section>
        )}

        {orderId && (
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
              <Upload size={20} className="text-white" />
              <span className="text-white font-bold">
                {SLIP_UPLOAD_LABEL_JA}
                <span className="block text-white/80 text-xs font-normal">{SLIP_UPLOAD_LABEL_TH}</span>
              </span>
            </div>
            <div className="p-4 space-y-4">
              {slipError && (
                <p className="text-red-600 text-sm">{slipError}</p>
              )}
              {slipUploaded ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle size={20} />
                  Upload Complete
                  <span className="text-green-500 text-xs">(อัพโหลดเรียบร้อย)</span>
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
                      {SLIP_UPLOAD_LABEL_JA}
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
                          Compressing & Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Upload Slip
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )}

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
      </main>
      <Footer />
    </div>
  );
}
