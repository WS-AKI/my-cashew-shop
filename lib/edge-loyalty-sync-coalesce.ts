/**
 * Cloudflare Workers 等のエッジではリクエストごとに isolate が分かれるため、
 * これは「同一 isolate 内」のバースト緩和用（クライアント不具合での連打対策）。
 * 本番の横断制限は WAF / Rate Limit ルールも併用してください。
 */

const COALESCE_MS = 2800;
const MAX_ENTRIES = 512;

type CachedPayload = Record<string, unknown>;

const cache = new Map<string, { t: number; payload: CachedPayload }>();

function prune(now: number) {
  if (cache.size <= MAX_ENTRIES) return;
  const cutoff = now - COALESCE_MS * 3;
  for (const [k, v] of cache) {
    if (v.t < cutoff) cache.delete(k);
  }
  if (cache.size > MAX_ENTRIES) {
    const entries = [...cache.entries()].sort((a, b) => a[1].t - b[1].t);
    for (let i = 0; i < entries.length - MAX_ENTRIES / 2; i++) {
      cache.delete(entries[i][0]);
    }
  }
}

/**
 * 直近の成功レスポンスを userId 単位で短時間返す。見つからなければ null。
 */
export function getRecentLoyaltySyncResponse(
  userId: string,
  now: number = Date.now(),
): CachedPayload | null {
  const row = cache.get(userId);
  if (!row || now - row.t >= COALESCE_MS) return null;
  return { ...row.payload, coalesced: true };
}

export function setRecentLoyaltySyncResponse(userId: string, payload: CachedPayload, now: number = Date.now()) {
  cache.set(userId, { t: now, payload: { ...payload } });
  prune(now);
}
