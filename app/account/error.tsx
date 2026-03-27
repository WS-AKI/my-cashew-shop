"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AccountError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="h-12 w-12 text-amber-400 mb-4" />
      <h1 className="text-xl font-semibold text-amber-950 mb-2">
        読み込みに失敗しました
      </h1>
      <p className="text-amber-800/55 text-sm mb-8">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          再試行 / ลองใหม่
        </button>
        <Link
          href="/account"
          className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-800 font-semibold px-5 py-2.5 text-sm hover:bg-amber-50 transition-colors"
        >
          マイページへ
        </Link>
      </div>
    </div>
  );
}
