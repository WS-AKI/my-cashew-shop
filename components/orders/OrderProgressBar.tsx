"use client";

import {
  Banknote,
  Check,
  ClipboardCheck,
  Coffee,
  Flame,
  PackageCheck,
  Truck,
} from "lucide-react";
import {
  isConnectorFilledAfter,
  isStepActive,
  isStepCompleted,
  orderStatusToProgressState,
} from "@/lib/order-progress";

const STEPS = [
  {
    key: "received",
    labelJa: "ご注文受付",
    labelTh: "รับคำสั่งซื้อ",
    Icon: ClipboardCheck,
  },
  {
    key: "payment",
    labelJa: "ご入金確認",
    labelTh: "ยืนยันการชำระเงิน",
    Icon: Banknote,
  },
  {
    key: "roast",
    labelJa: "焙煎・準備中",
    labelTh: "คั่วและเตรียมจัดส่ง",
    Icon: Coffee,
  },
  {
    key: "shipped",
    labelJa: "発送済み",
    labelTh: "จัดส่งแล้ว",
    Icon: Truck,
  },
  {
    key: "delivered",
    labelJa: "お届け完了",
    labelTh: "ส่งมอบสำเร็จ",
    Icon: PackageCheck,
  },
] as const;

type Language = "ja" | "th";

type Props = {
  status: string | null | undefined;
  language?: Language;
  className?: string;
  /** 一覧行など：副語を省略 */
  compact?: boolean;
};

function ProgressStepCircle({
  stepIndex,
  activeStepIndex,
  allComplete,
  Icon,
  showCraftAccent,
}: {
  stepIndex: number;
  activeStepIndex: number;
  allComplete: boolean;
  Icon: (typeof STEPS)[number]["Icon"];
  showCraftAccent: boolean;
}) {
  const done = isStepCompleted(stepIndex, activeStepIndex, allComplete);
  const active = isStepActive(stepIndex, activeStepIndex, allComplete);

  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 md:h-11 md:w-11 ${
        done
          ? "border-amber-500 bg-amber-500 text-white shadow-sm"
          : active
            ? "border-amber-500 bg-amber-50 text-amber-700 shadow-[0_0_0_4px_rgba(245,158,11,0.2)] md:scale-105"
            : "border-gray-200 bg-white text-gray-300"
      }`}
    >
      {done ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-4 w-4 md:h-[18px] md:w-[18px]" />}
      {showCraftAccent && active && (
        <span className="absolute -right-1 -top-1 flex gap-0.5" aria-hidden>
          <Flame className="h-4 w-4 text-orange-500 drop-shadow-sm" />
          <Coffee className="h-3.5 w-3.5 text-amber-800 drop-shadow-sm" />
        </span>
      )}
    </div>
  );
}

function HorizontalConnector({ filled }: { filled: boolean }) {
  return (
    <div
      className={`mx-0.5 hidden h-0.5 min-w-[8px] flex-1 self-start md:block ${filled ? "bg-amber-500" : "bg-gray-200"}`}
      style={{ marginTop: "1.375rem" }}
      aria-hidden
    />
  );
}

export default function OrderProgressBar({ status, language = "ja", className = "", compact = false }: Props) {
  const { activeStepIndex, allComplete } = orderStatusToProgressState(status);

  return (
    <div
      className={`rounded-2xl border border-amber-100/80 bg-white/90 px-3 py-4 shadow-sm md:px-5 ${className}`}
      role="group"
      aria-label={language === "ja" ? "ご注文の進捗" : "สถานะคำสั่งซื้อ"}
    >
      {/* モバイル: 縦タイムライン（左レール＋右に文言） */}
      <div className="flex flex-col md:hidden">
        {STEPS.map((step, i) => {
          const filledAfter = isConnectorFilledAfter(i, activeStepIndex, allComplete);
          const active = isStepActive(i, activeStepIndex, allComplete);
          const done = isStepCompleted(i, activeStepIndex, allComplete);
          const showCraft = step.key === "roast" && active;
          return (
            <div key={step.key}>
              <div className="flex gap-3">
                <div className="flex w-10 shrink-0 flex-col items-center">
                  <ProgressStepCircle
                    stepIndex={i}
                    activeStepIndex={activeStepIndex}
                    allComplete={allComplete}
                    Icon={step.Icon}
                    showCraftAccent={step.key === "roast"}
                  />
                </div>
                <div className="min-w-0 flex-1 pb-1 pt-0.5">
                  <p className={`text-sm font-semibold leading-snug ${done || active ? "text-amber-950" : "text-gray-400"}`}>
                    {language === "ja" ? step.labelJa : step.labelTh}
                  </p>
                  {!compact && (
                    <p className={`mt-0.5 text-xs leading-snug ${done || active ? "text-amber-800/60" : "text-gray-300"}`}>
                      {language === "ja" ? step.labelTh : step.labelJa}
                    </p>
                  )}
                  {showCraft && (
                    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-medium text-orange-900/90">
                      <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500" aria-hidden />
                      <Coffee className="h-3.5 w-3.5 shrink-0 text-amber-900" aria-hidden />
                      <span>{language === "ja" ? "丁寧に焙煎・詰め合わせています" : "กำลังคั่วและแพ็คอย่างพิถีพิถัน"}</span>
                    </p>
                  )}
                </div>
              </div>
              {i < STEPS.length - 1 ? (
                <div className="ml-[19px] flex w-10 justify-center py-1">
                  <div
                    className={`w-0.5 rounded-full ${filledAfter ? "bg-amber-500" : "bg-gray-200"} ${compact ? "min-h-[6px]" : "min-h-[12px]"}`}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* md+: 横並び */}
      <div className="hidden md:flex md:items-start md:justify-between">
        {STEPS.map((step, i) => {
          const filledAfter = isConnectorFilledAfter(i, activeStepIndex, allComplete);
          const showCraft = step.key === "roast";
          return (
            <div key={step.key} className="contents">
              <div className="flex min-w-0 flex-1 flex-col items-center px-0.5">
                <ProgressStepCircle
                  stepIndex={i}
                  activeStepIndex={activeStepIndex}
                  allComplete={allComplete}
                  Icon={step.Icon}
                  showCraftAccent={showCraft}
                />
                <p
                  className={`mt-2 text-center text-[11px] font-semibold leading-tight text-balance ${
                    isStepCompleted(i, activeStepIndex, allComplete) || isStepActive(i, activeStepIndex, allComplete)
                      ? "text-amber-900"
                      : "text-gray-400"
                  }`}
                >
                  {language === "ja" ? step.labelJa : step.labelTh}
                </p>
                {!compact && (
                  <p
                    className={`mt-0.5 text-center text-[10px] leading-tight text-balance ${
                      isStepCompleted(i, activeStepIndex, allComplete) || isStepActive(i, activeStepIndex, allComplete)
                        ? "text-amber-700/65"
                        : "text-gray-300"
                    }`}
                  >
                    {language === "ja" ? step.labelTh : step.labelJa}
                  </p>
                )}
              </div>
              {i < STEPS.length - 1 ? <HorizontalConnector filled={filledAfter} /> : null}
            </div>
          );
        })}
      </div>

    </div>
  );
}
