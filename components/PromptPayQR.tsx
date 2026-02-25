"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
// CommonJS package; default export is generatePayload
import generatePayload from "promptpay-qr";

const SIZE = 224;

type Props = {
  /** 請求金額（バーツ）。この金額がQRに埋め込まれ、アプリ側で自動入力されます。 */
  amountBaht: number;
  /** PromptPayに紐づくID（電話番号・口座番号・National IDなど）。getPromptPayId() で取得。 */
  promptPayId: string;
  /** アクセシビリティ用のタイトル */
  title?: string;
};

/**
 * 請求金額を埋め込んだPromptPay QRコードを表示するクライアントコンポーネント。
 * オームシン銀行などの口座番号（020457390910）や電話番号を promptPayId に指定可能。
 */
export function PromptPayQR({ amountBaht, promptPayId, title = "PromptPay QR" }: Props) {
  const payload = useMemo(() => {
    if (!promptPayId.trim()) return null;
    try {
      return generatePayload(promptPayId.trim(), { amount: amountBaht });
    } catch {
      return null;
    }
  }, [promptPayId, amountBaht]);

  if (!payload) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 text-sm"
        style={{ width: SIZE, height: SIZE }}
      >
        QRを生成できません
      </div>
    );
  }

  return (
    <QRCodeSVG
      value={payload}
      size={SIZE}
      level="M"
      bgColor="#ffffff"
      fgColor="#000000"
      marginSize={1}
      title={title}
      className="max-w-full max-h-full"
    />
  );
}
