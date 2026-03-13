"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ChevronRight, Copy, Check, Building2, Upload, Loader2, FileText, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { useAudience } from "@/context/AudienceContext";
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

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "";
  const audience = useAudience();

  const [copied, setCopied] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [slipAmountInput, setSlipAmountInput] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipUploading, setSlipUploading] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);
  const [qrImageError, setQrImageError] = useState(false);
  const [qrTriedFallback, setQrTriedFallback] = useState(false);
  const [slipOcrReading, setSlipOcrReading] = useState(false);
  const [slipOcrDone, setSlipOcrDone] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      try {
        const { data } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("id", orderId)
          .single();
        if (!cancelled && data && typeof data.total_amount === "number") setOrderTotal(data.total_amount);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  /** スリップ画像から金額らしき数値を抽出（OCR）。注文合計に近い or 妥当な金額を返す。 */
  async function tryReadAmountFromSlipImage(file: File, orderTotalBaht: number | null): Promise<number | null> {
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const text = data.text || "";
      // 数字のみ抽出（カンマ・ピリオド付きも）。例: 150, 1,500, 150.00
      const matches = text.match(/\d[\d,.]*/g) || [];
      const numbers: number[] = [];
      for (const m of matches) {
        const n = Math.round(parseFloat(m.replace(/,/g, "")));
        if (Number.isFinite(n) && n >= 1 && n <= 9999999) numbers.push(n);
      }
      if (numbers.length === 0) return null;
      // 注文合計があればそれに一番近い値、なければ最大額（振込額は大きめのことが多い）
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

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setSlipError(null);
    setSlipUploaded(false);
    setSlipOcrDone(false);
    setSlipAmountInput("");
    setSlipOcrReading(true);
    void (async () => {
      const amount = await tryReadAmountFromSlipImage(file, orderTotal);
      setSlipOcrReading(false);
      if (amount != null) {
        setSlipAmountInput(String(amount));
        setSlipOcrDone(true);
      }
    })();
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
        fileType: "image/jpeg",
      });
      const path = `slips/${orderId}-${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage.from("slips").upload(path, compressed, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (uploadErr) {
        throw new Error(`アップロード: ${uploadErr.message}`);
      }
      const { data: urlData } = supabase.storage.from("slips").getPublicUrl(path);
      const { error: updateErr } = await supabase
        .from("orders")
        .update({ slip_image_url: urlData.publicUrl })
        .eq("id", orderId);
      if (updateErr) {
        throw new Error(`注文の更新: ${updateErr.message}. Supabase で orders の「Enable update for anon」ポリシーを追加してください。`);
      }
      setSlipUploaded(true);
      setSlipPreview(urlData.publicUrl);
      fetch("/api/notify-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      }).catch(() => {});
    } catch (err) {
      setSlipError(err instanceof Error ? err.message : "アップロードに失敗しました");
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
        {/* Success header: スリップアップロード後に「ご注文を承りました」 */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className={slipUploaded ? "text-green-500" : "text-amber-500"} />
          </div>
          <h1 className="text-2xl font-extrabold text-amber-950 mb-2">
            <DualLanguageLabel
              primary={slipUploaded ? T.titleConfirmed[audience] : T.titleReceived[audience]}
              secondary={slipUploaded ? T.titleConfirmed[audience === "ja" ? "th" : "ja"] : T.titleReceived[audience === "ja" ? "th" : "ja"]}
            />
          </h1>
          <p className="text-gray-600 text-sm">
            <DualLanguageLabel
              primary={slipUploaded ? T.thankYou[audience] : T.thankYouReceived[audience]}
              secondary={slipUploaded ? T.thankYou[audience === "ja" ? "th" : "ja"] : T.thankYouReceived[audience === "ja" ? "th" : "ja"]}
            />
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
              <p className="text-amber-700 text-sm font-medium mb-2 flex items-center gap-1.5">
                <Search size={14} />
                注文後の状況は「<Link href="/track" className="underline hover:text-amber-800">注文状況の確認</Link>」ページでいつでもご確認いただけます。ヘッダー・フッターからもアクセスできます。
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
              <DualLanguageLabel primary={T.paymentMethod[audience]} secondary={T.paymentMethod[audience === "ja" ? "th" : "ja"]} className="text-white" secondaryClassName="text-white/80 text-xs" />
            </span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-amber-800 text-sm font-medium">
              <DualLanguageLabel primary={T.notePayment[audience]} secondary={T.notePayment[audience === "ja" ? "th" : "ja"]} />
            </p>
            <div className="border-t border-amber-100 pt-4 space-y-3">
              <div>
                <p className="text-gray-400 text-xs font-medium">
                  <DualLanguageLabel primary={T.bankName[audience]} secondary={T.bankName[audience === "ja" ? "th" : "ja"]} />
                </p>
                <p className="text-gray-800 font-bold mt-0.5">{BANK_INFO.bankName}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    <DualLanguageLabel primary={T.accountName[audience]} secondary={T.accountName[audience === "ja" ? "th" : "ja"]} />
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
                  {copied === "name" ? T.copied[audience] : T.copy[audience]}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    <DualLanguageLabel primary={T.accountNumber[audience]} secondary={T.accountNumber[audience === "ja" ? "th" : "ja"]} />
                  </p>
                  <p className="text-gray-800 font-bold text-lg tracking-wider mt-0.5">{BANK_INFO.accountNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(BANK_INFO.accountNumber, "number")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium shrink-0"
                >
                  {copied === "number" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "number" ? T.copied[audience] : T.copy[audience]}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PromptPay QR + 請求金額 */}
        {BANK_INFO.promptPayQrPath && (
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-amber-500 px-4 py-3 flex items-center gap-2">
              <span className="text-white font-bold">
                <DualLanguageLabel primary={T.promptPay[audience]} secondary={T.promptPay[audience === "ja" ? "th" : "ja"]} className="text-white" secondaryClassName="text-white/80 text-xs" />
              </span>
            </div>
            <div className="p-4 flex flex-col items-center gap-3">
              {/* 請求金額を目立たせる */}
              {orderTotal != null && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-700 font-medium">
                    <DualLanguageLabel primary={T.orderTotalLabel[audience]} secondary={T.orderTotalLabel[audience === "ja" ? "th" : "ja"]} />
                  </p>
                  <p className="text-2xl font-extrabold text-amber-600 mt-0.5">฿{orderTotal.toLocaleString()}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    スキャン後、この金額を入力してください
                    <span className="block text-amber-500" lang="th">สแกนแล้วกรอกจำนวนนี้</span>
                  </p>
                </div>
              )}
              {/* 静的QR画像（オームシン マーチャントQR） */}
              <div className="w-[224px] h-[224px] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                {qrImageError ? (
                  <p className="text-gray-500 text-sm text-center px-2">
                    QRコード画像がありません。public フォルダに promptpay-qr.png または promptpay-qr.jpg を配置してください。
                  </p>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrTriedFallback && "promptPayQrPathFallback" in BANK_INFO ? BANK_INFO.promptPayQrPathFallback : BANK_INFO.promptPayQrPath}
                      alt="PromptPay QR"
                      width={224}
                      height={224}
                      className="max-w-full max-h-full object-contain"
                      onError={() => {
                        if (!qrTriedFallback && "promptPayQrPathFallback" in BANK_INFO && BANK_INFO.promptPayQrPathFallback) {
                          setQrTriedFallback(true);
                        } else {
                          setQrImageError(true);
                        }
                      }}
                    />
                  </>
                )}
              </div>
              {"accountNameTH" in BANK_INFO && (
                <p className="text-gray-500 text-sm" lang="th">
                  {BANK_INFO.accountNameTH}
                </p>
              )}
            </div>
          </section>
        )}

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
              {orderTotal != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <p className="text-gray-600 text-xs">
                    <DualLanguageLabel primary={T.orderTotalLabel[audience]} secondary={T.orderTotalLabel[audience === "ja" ? "th" : "ja"]} />
                  </p>
                  <p className="text-gray-900 font-bold text-lg">฿{orderTotal.toLocaleString()}</p>
                </div>
              )}
              {!slipUploaded && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
                  <p className="text-orange-700 text-sm font-medium">
                    お振込後、スリップ（振込証明）をアップロードしてください。
                  </p>
                  <p className="text-orange-500 text-xs">
                    กรุณาอัพโหลดสลิปหลังโอนเงิน เพื่อยืนยันการชำระเงิน
                  </p>
                  <p className="text-orange-600 text-xs font-medium pt-1 border-t border-orange-200/70">
                    サイトからアップロードが難しい場合は、<strong>公式LINEでスリップの写真を送っていただくことも可能</strong>です。フッターの公式LINEからご連絡ください。
                  </p>
                </div>
              )}

              {orderTotal != null && !slipUploaded && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DualLanguageLabel primary={T.slipAmountLabel[audience]} secondary={T.slipAmountLabel[audience === "ja" ? "th" : "ja"]} />
                    <span className="text-amber-600 font-medium ml-1">
                      <DualLanguageLabel primary={T.slipAmountRequired[audience]} secondary={T.slipAmountRequired[audience === "ja" ? "th" : "ja"]} />
                    </span>
                  </label>
                  {slipOcrReading && (
                    <p className="text-amber-600 text-sm mb-2 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin flex-shrink-0" />
                      <DualLanguageLabel primary={T.slipOcrReading[audience]} secondary={T.slipOcrReading[audience === "ja" ? "th" : "ja"]} />
                    </p>
                  )}
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="例: 150"
                    value={slipAmountInput}
                    onChange={(e) => { setSlipAmountInput(e.target.value); setSlipOcrDone(false); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-800"
                  />
                  {slipOcrDone && slipAmountInput !== "" && (
                    <p className="mt-1.5 text-gray-600 text-xs flex items-center gap-1">
                      <DualLanguageLabel primary={T.slipAmountOcrHint[audience]} secondary={T.slipAmountOcrHint[audience === "ja" ? "th" : "ja"]} />
                    </p>
                  )}
                  {slipAmountInput !== "" && (() => {
                    const entered = Number(slipAmountInput);
                    if (Number.isNaN(entered) || entered < 0) return null;
                    if (entered < orderTotal) {
                      return (
                        <p className="mt-2 text-red-600 text-sm font-medium flex items-center gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</span>
                          <DualLanguageLabel primary={T.slipAmountMismatch[audience]} secondary={T.slipAmountMismatch[audience === "ja" ? "th" : "ja"]} />
                        </p>
                      );
                    }
                    if (entered === orderTotal) {
                      return (
                        <p className="mt-2 text-green-600 text-sm font-medium flex items-center gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span>
                          <DualLanguageLabel primary={T.slipAmountMatch[audience]} secondary={T.slipAmountMatch[audience === "ja" ? "th" : "ja"]} />
                        </p>
                      );
                    }
                    return (
                      <p className="mt-2 text-amber-700 text-sm font-medium flex items-center gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">i</span>
                        <DualLanguageLabel primary={T.slipAmountOver[audience]} secondary={T.slipAmountOver[audience === "ja" ? "th" : "ja"]} />
                      </p>
                    );
                  })()}
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
                      className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
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
              className="block w-full py-3 rounded-2xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-center flex items-center justify-center gap-2 border border-gray-700 shadow-sm"
            >
              <Search size={18} />
              注文状況を確認する
              <span className="text-white/70 text-xs">(ตรวจสอบสถานะ)</span>
            </Link>
            <Link
              href="/#products"
              className="block w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              {T.continueShopping[audience]}
              <span className="text-white/80 text-xs">({T.continueShopping[audience === "ja" ? "th" : "ja"]})</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          !orderId && (
            <div className="text-center">
              <Link
                href="/#products"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-2xl shadow-sm"
              >
                {T.continueShopping[audience]}
                <span className="text-white/80 text-xs ml-1">({T.continueShopping[audience === "ja" ? "th" : "ja"]})</span>
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
