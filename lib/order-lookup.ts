/**
 * 注文追跡・検索用の入力を正規化する。
 * - 先頭の # を除去
 * - 完全な UUID（ハイフンあり／32桁16進）を受理
 * - 管理画面の「#xxxxxxxx」形式の短縮参照は 8 桁プレフィックスとして返す（RPC 解決用）
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderLookupNormalized =
  | { kind: "uuid"; id: string }
  | { kind: "prefix"; prefix: string }
  | { kind: "invalid" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX32_RE = /^[0-9a-f]{32}$/i;
const PREFIX_RE = /^[0-9a-f]{8}$/i;

export function normalizeOrderLookupRef(raw: string): OrderLookupNormalized {
  let s = raw.trim();
  s = s.replace(/^#+\s*/, "").trim();
  s = s.replace(/\s+/g, "");
  if (!s) return { kind: "invalid" };

  const lower = s.toLowerCase();

  if (UUID_RE.test(lower)) {
    return { kind: "uuid", id: lower };
  }
  if (HEX32_RE.test(lower)) {
    const id = `${lower.slice(0, 8)}-${lower.slice(8, 12)}-${lower.slice(12, 16)}-${lower.slice(16, 20)}-${lower.slice(20)}`;
    return { kind: "uuid", id };
  }
  if (PREFIX_RE.test(lower)) {
    return { kind: "prefix", prefix: lower };
  }
  /** 9〜31 桁の 16 進（貼りミス等）は先頭 8 桁をプレフィックスとして扱う */
  if (/^[0-9a-f]+$/i.test(lower) && lower.length > 8 && lower.length < 32) {
    return { kind: "prefix", prefix: lower.slice(0, 8) };
  }

  return { kind: "invalid" };
}

/** /track などで取得する注文の最小行 */
export type OrderTrackRow = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  slip_image_url?: string | null;
};

const ORDER_SELECT = "id, status, total_amount, created_at, slip_image_url" as const;

/**
 * 正規化結果に応じて 1 件の注文行を解決する。
 * 短縮プレフィックスは RPC `find_orders_by_id_prefix` を優先し、未適用時は直近注文からフォールバック探索する。
 */
export async function resolveOrderRowForLookup(
  supabase: SupabaseClient,
  norm: OrderLookupNormalized,
): Promise<
  | { ok: true; row: OrderTrackRow }
  | { ok: false; reason: "invalid" | "not_found" | "ambiguous" | "db_error"; details?: string }
> {
  if (norm.kind === "invalid") {
    return { ok: false, reason: "invalid" };
  }

  if (norm.kind === "uuid") {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", norm.id)
      .maybeSingle();
    if (error) return { ok: false, reason: "db_error", details: error.message };
    if (!data) return { ok: false, reason: "not_found" };
    return { ok: true, row: data as OrderTrackRow };
  }

  const prefix = norm.prefix;

  const { data: rpcRows, error: rpcErr } = await supabase.rpc("find_orders_by_id_prefix", {
    p_prefix: prefix,
  });

  if (!rpcErr && Array.isArray(rpcRows)) {
    if (rpcRows.length === 0) return { ok: false, reason: "not_found" };
    if (rpcRows.length > 1) return { ok: false, reason: "ambiguous" };
    return { ok: true, row: rpcRows[0] as OrderTrackRow };
  }

  const { data: recent, error: recentErr } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(400);

  if (recentErr) {
    return { ok: false, reason: "db_error", details: recentErr.message };
  }

  const hits = (recent ?? []).filter((o: { id: string }) =>
    typeof o.id === "string" ? o.id.toLowerCase().startsWith(prefix) : false,
  );
  if (hits.length === 0) return { ok: false, reason: "not_found" };
  if (hits.length > 1) return { ok: false, reason: "ambiguous" };
  return { ok: true, row: hits[0] as OrderTrackRow };
}
