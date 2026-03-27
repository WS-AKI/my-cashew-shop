"use client";

import { CheckCircle2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

type ToastType = "success" | "error";

function messageFromSearch(params: URLSearchParams): { type: ToastType; text: string } | null {
  const auth = params.get("auth");
  if (auth === "success") {
    return { type: "success", text: "ログインしました" };
  }
  if (auth === "failed") {
    return { type: "error", text: "ログインに失敗しました。もう一度お試しください。" };
  }
  return null;
}

export default function AuthNoticeToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const msg = useMemo(() => messageFromSearch(new URLSearchParams(searchParams.toString())), [searchParams]);

  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    }, 2400);
    return () => {
      window.clearTimeout(t);
    };
  }, [msg, pathname, router, searchParams]);

  if (!msg) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[220] transition-all duration-300 opacity-100 translate-y-0"
      role="status"
      aria-live="polite"
    >
      <div
        className={`min-w-[220px] rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
          msg.type === "success"
            ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
            : "bg-red-50/95 border-red-200 text-red-800"
        }`}
      >
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          {msg.type === "success" ? <CheckCircle2 size={16} /> : null}
          {msg.text}
        </p>
      </div>
    </div>
  );
}
