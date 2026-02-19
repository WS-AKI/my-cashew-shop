"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle,
  Copy,
  Check,
  Upload,
  Loader2,
  QrCode,
  Building2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

// ─── 銀行口座情報（実際の情報に変更してください） ───────────
const BANK_INFO = {
  bankName: "〇〇銀行",
  branchName: "〇〇支店",
  accountType: "普通",
  accountNumber: "1234567",
  accountName: "カシュー ハナコ",
} as const;

// QRコード画像があれば public フォルダに置いてパスを指定
const QR_CODE_IMAGE = ""; // 例: "/qr-promptpay.png"
// ────────────────────────────────────────────────────────────

export default function CheckoutSuccessPage() {
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ─── クリップボードにコピー ──────────────────────────────
  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // フォールバック（古いブラウザ対応）
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  // ─── スリップ画像選択 ────────────────────────────────────
  function handleSlipChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setUploaded(false);
    setUploadError(null);
  }

  // ─── スリップ画像をアップロード ─────────────────────────
  async function handleSlipUpload() {
    if (!slipFile) return;
    setUploading(true);
    setUploadError(null);

    const ext = slipFile.name.split(".").pop();
    const fileName = `slips/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("payment-slips")
      .upload(fileName, slipFile);

    setUploading(false);

    if (error) {
      setUploadError(`アップロードに失敗しました: ${error.message}`);
      return;
    }

    setUploaded(true);
  }

  function CopyButton({ value, label }: { value: string; label: string }) {
    const isCopied = copied === label;
    return (
      <button
        onClick={() => copyToClipboard(value, label)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
          isCopied
            ? "bg-green-100 text-green-600"
            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        }`}
      >
        {isCopied ? (
          <>
            <Check size={14} />
            コピー済み
          </>
        ) : (
          <>
            <Copy size={14} />
            コピー
          </>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-16">
      {/* 注文完了バナー */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-10 pb-16 text-center">
        <div className="flex justify-center mb-3">
          <CheckCircle size={56} className="text-white" />
        </div>
        <h1 className="text-white font-bold text-2xl">ご注文ありがとうございます！</h1>
        <p className="text-white/90 mt-2 text-sm">
          以下の口座へ振込をお願いします。
          <br />
          入金確認後、発送いたします。
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4">
        {/* ─── 銀行口座情報カード ──────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-amber-500 px-5 py-3 flex items-center gap-2">
            <Building2 size={20} className="text-white" />
            <h2 className="text-white font-bold text-lg">振込先口座</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* 銀行名 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium">銀行名</p>
                <p className="text-gray-800 font-bold text-lg mt-0.5">
                  {BANK_INFO.bankName}
                </p>
              </div>
            </div>

            {/* 支店名 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium">支店名</p>
                <p className="text-gray-800 font-bold text-lg mt-0.5">
                  {BANK_INFO.branchName}
                </p>
              </div>
            </div>

            {/* 口座種別 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium">口座種別</p>
                <p className="text-gray-800 font-bold text-lg mt-0.5">
                  {BANK_INFO.accountType}
                </p>
              </div>
            </div>

            {/* 口座番号（コピーボタン付き） */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium">口座番号</p>
                <p className="text-gray-800 font-bold text-2xl mt-0.5 tracking-widest">
                  {BANK_INFO.accountNumber}
                </p>
              </div>
              <CopyButton
                value={BANK_INFO.accountNumber}
                label="account"
              />
            </div>

            {/* 名義（コピーボタン付き） */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-gray-400 font-medium">口座名義</p>
                <p className="text-gray-800 font-bold text-xl mt-0.5">
                  {BANK_INFO.accountName}
                </p>
              </div>
              <CopyButton value={BANK_INFO.accountName} label="name" />
            </div>

            {/* 全情報をまとめてコピー */}
            <button
              onClick={() =>
                copyToClipboard(
                  `${BANK_INFO.bankName} ${BANK_INFO.branchName} ${BANK_INFO.accountType} ${BANK_INFO.accountNumber} ${BANK_INFO.accountName}`,
                  "all"
                )
              }
              className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                copied === "all"
                  ? "bg-green-500 text-white"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {copied === "all" ? (
                <>
                  <Check size={20} />
                  コピーしました！
                </>
              ) : (
                <>
                  <Copy size={20} />
                  口座情報をまとめてコピー
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── QRコード（設定されている場合のみ表示） ─────── */}
        {QR_CODE_IMAGE && (
          <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode size={20} className="text-amber-500" />
              <h3 className="font-bold text-gray-800">QRコードで振込</h3>
            </div>
            <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden">
              <Image
                src={QR_CODE_IMAGE}
                alt="振込用QRコード"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-500 text-sm mt-3">
              スキャンして振込アプリを開いてください
            </p>
          </div>
        )}

        {/* ─── 振込スリップのアップロード ─────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 px-5 py-3 flex items-center gap-2">
            <Upload size={20} className="text-white" />
            <h2 className="text-white font-bold text-lg">振込明細をアップロード</h2>
          </div>

          <div className="p-5">
            <p className="text-gray-600 text-sm mb-4">
              振込完了後、振込明細のスクリーンショットや画像をアップロードしてください。確認後、すぐに発送準備を始めます。
            </p>

            {/* プレビュー */}
            {slipPreview && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={slipPreview}
                  alt="振込明細プレビュー"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* エラー */}
            {uploadError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {uploadError}
              </div>
            )}

            {/* 完了メッセージ */}
            {uploaded && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-700 font-medium">
                <CheckCircle size={20} className="text-green-500" />
                アップロード完了！確認後にご連絡します。
              </div>
            )}

            {/* ファイル選択 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSlipChange}
              className="hidden"
            />

            {!uploaded && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-orange-300 rounded-xl py-6 flex flex-col items-center gap-2 hover:bg-orange-50 transition-colors mb-3"
              >
                <Upload size={36} className="text-orange-400" />
                <span className="text-orange-600 font-medium">
                  {slipFile ? slipFile.name : "タップして画像を選択"}
                </span>
                <span className="text-orange-400 text-xs">
                  JPG, PNG, PDF に対応
                </span>
              </button>
            )}

            {/* アップロードボタン */}
            {slipFile && !uploaded && (
              <button
                onClick={handleSlipUpload}
                disabled={uploading}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-60 active:scale-95"
              >
                {uploading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload size={22} />
                    振込明細を送る
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ─── 注意事項 ────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertCircle size={18} />
            ご注意ください
          </h3>
          <ul className="space-y-2 text-amber-700 text-sm">
            {[
              "振込手数料はお客様のご負担となります",
              "ご注文後7日以内にお振込をお願いします",
              "振込完了後、1〜2営業日以内に発送いたします",
              "ご不明な点はInstagramのDMよりお気軽にどうぞ",
            ].map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
