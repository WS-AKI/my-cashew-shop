/**
 * orders.status を UI の5段階プログレスと同期する。
 * 管理画面・DB の正規値: pending | price_confirmed | shipping | delivered（+ 旧 paid / shipped）
 */

export type NormalizedOrderStatus = "pending" | "price_confirmed" | "shipping" | "delivered";

const ALLOWED: readonly string[] = ["pending", "price_confirmed", "shipping", "delivered"];

export function normalizeOrderDbStatus(s: string | null | undefined): NormalizedOrderStatus {
  const val = (s ?? "").toLowerCase().trim();
  if (val === "paid") return "price_confirmed";
  if (val === "shipped") return "shipping";
  if (ALLOWED.includes(val)) return val as NormalizedOrderStatus;
  return "pending";
}

/**
 * activeStepIndex: 現在アクティブなステップ（0..4）。
 * - pending → 1（①完了想定、②ご入金確認が進行中）
 * - price_confirmed → 2（③焙煎・準備中）
 * - shipping → 3（④発送済み・配送中）
 * - delivered → allComplete（⑤まで全完了表示）
 */
export function orderStatusToProgressState(status: string | null | undefined): {
  activeStepIndex: number;
  allComplete: boolean;
} {
  const n = normalizeOrderDbStatus(status);
  if (n === "delivered") return { activeStepIndex: 4, allComplete: true };
  if (n === "shipping") return { activeStepIndex: 3, allComplete: false };
  if (n === "price_confirmed") return { activeStepIndex: 2, allComplete: false };
  if (n === "pending") return { activeStepIndex: 1, allComplete: false };
  return { activeStepIndex: 0, allComplete: false };
}

/** ノード i が「完了」スタイルか */
export function isStepCompleted(
  stepIndex: number,
  activeStepIndex: number,
  allComplete: boolean,
): boolean {
  if (allComplete) return true;
  return stepIndex < activeStepIndex;
}

/** ノード i が「現在」ハイライトか */
export function isStepActive(
  stepIndex: number,
  activeStepIndex: number,
  allComplete: boolean,
): boolean {
  if (allComplete) return false;
  return stepIndex === activeStepIndex;
}

/** ノード stepIndex の右側のコネクタが塗りつぶしか（最後のノードは false） */
export function isConnectorFilledAfter(
  stepIndex: number,
  activeStepIndex: number,
  allComplete: boolean,
): boolean {
  if (allComplete) return stepIndex < 4;
  return activeStepIndex > stepIndex;
}
