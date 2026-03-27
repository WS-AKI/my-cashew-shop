"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const STORAGE_PREFIX = "cashew-shop:announcement-suppressed:";

export type AnnouncementDisplayPeriod = {
  /** ISO 8601 — この日時以降に表示を開始 */
  from?: string;
  /** ISO 8601 — この日時まで表示（終了日時を過ぎたら出さない） */
  until?: string;
};

export type AnnouncementPopupProps = {
  /** LocalStorage のキーに使う一意ID（管理画面のお知らせIDなど） */
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  /** 画像が情報を伝える場合に指定（省略時は装飾扱いで alt 空） */
  imageAlt?: string;
  /** CMS の表示期間。未指定なら期間チェックなし */
  displayPeriod?: AnnouncementDisplayPeriod;
  /** 「今後表示しない」選択時に再表示を抑止する日数 */
  suppressDurationDays?: number;
  /** オーバーレイを出すまでの遅延（ms）。0.5〜1秒推奨 */
  openDelayMs?: number;
  dismissCheckboxLabel?: string;
  closeButtonLabel?: string;
  overlayDismissAriaLabel?: string;
  /** false のときは一切表示しない（フラグをDBから渡す想定） */
  enabled?: boolean;
};

function isWithinDisplayPeriod(period?: AnnouncementDisplayPeriod): boolean {
  if (!period?.from && !period?.until) return true;
  const now = Date.now();
  if (period.from) {
    const t = Date.parse(period.from);
    if (!Number.isNaN(t) && now < t) return false;
  }
  if (period.until) {
    const t = Date.parse(period.until);
    if (!Number.isNaN(t) && now > t) return false;
  }
  return true;
}

function readSuppressedUntil(storageId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_PREFIX + storageId);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function writeSuppressedUntil(storageId: string, untilMs: number) {
  localStorage.setItem(STORAGE_PREFIX + storageId, String(untilMs));
}

export default function AnnouncementPopup({
  id: storageId,
  title,
  body,
  imageUrl,
  imageAlt = "",
  displayPeriod,
  suppressDurationDays = 7,
  openDelayMs = 700,
  dismissCheckboxLabel = "今後このメッセージを表示しない",
  closeButtonLabel = "閉じる",
  overlayDismissAriaLabel = "オーバーレイを閉じる",
  enabled = true,
}: AnnouncementPopupProps) {
  const titleId = useId();
  const descId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    if (dontShowAgain) {
      const until = Date.now() + suppressDurationDays * 86_400_000;
      writeSuppressedUntil(storageId, until);
    }
    setLeaving(true);
    leaveTimerRef.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      setMounted(false);
    }, 280);
  }, [dontShowAgain, storageId, suppressDurationDays]);

  useEffect(() => {
    if (!enabled || !isWithinDisplayPeriod(displayPeriod)) return;

    const suppressedUntil = readSuppressedUntil(storageId);
    if (suppressedUntil !== null && Date.now() < suppressedUntil) return;

    openTimerRef.current = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, openDelayMs);

    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, [enabled, displayPeriod, storageId, openDelayMs]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !visible || leaving) return;
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 400);
    return () => clearTimeout(t);
  }, [mounted, visible, leaving]);

  useEffect(() => {
    if (!mounted || !visible || leaving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, visible, leaving, close]);

  if (!mounted) return null;

  const backdropStyle: CSSProperties = {
    opacity: visible && !leaving ? 1 : 0,
    transition: "opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  const panelStyle: CSSProperties = {
    opacity: visible && !leaving ? 1 : 0,
    transform:
      visible && !leaving ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
    transition: "opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8"
      role="presentation"
      style={{ pointerEvents: visible && !leaving ? "auto" : "none" }}
    >
      <button
        type="button"
        aria-label={overlayDismissAriaLabel}
        className="absolute inset-0 border-0 cursor-default bg-black/45 backdrop-blur-md supports-[backdrop-filter]:bg-black/35"
        style={backdropStyle}
        onClick={() => close()}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-[min(100%,28rem)] max-h-[min(90dvh,640px)] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-neutral-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.04)] outline-none"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => close()}
          className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          aria-label={closeButtonLabel}
        >
          <X className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {imageUrl ? (
            <div className="relative w-full shrink-0 bg-gradient-to-b from-amber-50/80 to-neutral-50">
              <div className="relative aspect-[16/10] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- Workers本番で next/image より確実 */}
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="absolute inset-0 h-full w-full object-contain p-3 sm:p-4"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
            <h2
              id={titleId}
              className="pr-10 text-xl font-bold leading-snug tracking-tight text-amber-950 sm:text-2xl"
            >
              {title}
            </h2>
            <p
              id={descId}
              className="text-[15px] leading-relaxed text-neutral-600 sm:text-base whitespace-pre-line"
            >
              {body}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/90 px-5 py-4 sm:px-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-2 -mx-1 transition-colors hover:bg-neutral-100/80">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm leading-snug text-neutral-700 select-none">{dismissCheckboxLabel}</span>
          </label>

          <button
            type="button"
            onClick={() => close()}
            className="mt-4 w-full rounded-2xl bg-amber-500 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 active:scale-[0.99]"
          >
            {closeButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
