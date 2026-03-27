"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl mb-4">😵</span>
      <h1 className="text-2xl font-bold text-amber-950 mb-2">
        予期しないエラーが発生しました
      </h1>
      <p className="text-amber-800/60 text-sm mb-1">
        ページの読み込みに問題が起きました。
      </p>
      <p className="text-amber-800/40 text-xs mb-8">
        เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 transition-colors"
        >
          再試行 / ลองใหม่
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white text-amber-800 font-bold px-6 py-3 hover:bg-amber-50 transition-colors"
        >
          トップへ / หน้าแรก
        </Link>
      </div>
    </div>
  );
}
