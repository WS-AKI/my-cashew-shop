"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { VipTier } from "@/lib/loyalty/sync-loyalty-profile";

export type RankBadgeTier = "silver" | "gold";

export type AuthSessionContextValue = {
  user: User | null;
  session: Session | null;
  /** DB の実ランク（未ログインは null） */
  vipTier: VipTier | null;
  /** ヘッダー用 Silver / Gold のみ。Normal・未ログインは null */
  rankBadge: RankBadgeTier | null;
  /** お祝いモーダル用。silver | gold のとき表示 */
  celebrationPendingTier: RankBadgeTier | null;
  lifetimeSpentThb: number | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshLoyalty: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

/** 同一タブでの sync-loyalty-profile 連打を防ぐ（TOKEN_REFRESHED 嵐・二重マウント対策） */
const SYNC_THROTTLE_MS = 2800;
/** ページリロード・新タブをまたぐ連打防止（Cloudflare Workers の isolate 再起動ごとの DB 往復を抑制） */
const SYNC_LS_KEY = "lp_sync_ts";
const SYNC_LS_MS = 5 * 60 * 1000; // 5 分

function isRecentSyncLS(): boolean {
  try {
    const ts = Number(localStorage.getItem(SYNC_LS_KEY) ?? "0");
    return Date.now() - ts < SYNC_LS_MS;
  } catch {
    return false;
  }
}

function markSyncLS(): void {
  try {
    localStorage.setItem(SYNC_LS_KEY, String(Date.now()));
  } catch { /* ignore */ }
}

function clearSyncLS(): void {
  try {
    localStorage.removeItem(SYNC_LS_KEY);
  } catch { /* ignore */ }
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}

export function useAuthSessionOptional(): AuthSessionContextValue | null {
  return useContext(AuthSessionContext);
}

function toRankBadge(tier: VipTier | null): RankBadgeTier | null {
  if (tier === "silver" || tier === "gold") return tier;
  return null;
}

function toCelebrationTier(raw: string | null | undefined): RankBadgeTier | null {
  if (raw === "silver" || raw === "gold") return raw;
  return null;
}

type SyncJson = {
  ok?: boolean;
  coalesced?: boolean;
  vipTier?: unknown;
  celebrationPendingTier?: string | null;
  lifetimeSpentThb?: number;
};

function parseSyncLoyaltyResponse(json: SyncJson): {
  vipTier: VipTier;
  celebrationPendingTier: RankBadgeTier | null;
  lifetimeSpentThb: number;
} | null {
  if (json.ok !== true) return null;
  const vt = json.vipTier;
  if (vt !== "normal" && vt !== "silver" && vt !== "gold") return null;
  return {
    vipTier: vt,
    celebrationPendingTier: toCelebrationTier(json.celebrationPendingTier ?? null),
    lifetimeSpentThb: typeof json.lifetimeSpentThb === "number" ? json.lifetimeSpentThb : 0,
  };
}

/**
 * トークン更新だけでは loyalty DB は変わらないのに getSession→Cookie 更新→TOKEN_REFRESHED→
 * 再度 sync が走るループを防ぐ。SIGNED_IN / USER_UPDATED / INITIAL_SESSION のみ同期する。
 */
function shouldSyncLoyaltyOnAuthEvent(event: AuthChangeEvent): boolean {
  if (event === "TOKEN_REFRESHED") return false;
  if (event === "SIGNED_OUT") return false;
  return event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED";
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vipTier, setVipTier] = useState<VipTier | null>(null);
  const [celebrationPendingTier, setCelebrationPendingTier] = useState<RankBadgeTier | null>(null);
  const [lifetimeSpentThb, setLifetimeSpentThb] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /** 進行中の同期を待てるようにし、INITIAL_SESSION とマウント force の取り違いで loading が先に false になるのを防ぐ */
  const inFlightSyncRef = useRef<Promise<void> | null>(null);
  const lastSyncStartedAtRef = useRef(0);

  const applyProfilePayload = useCallback((payload: {
    vipTier: VipTier | null;
    celebrationPendingTier: RankBadgeTier | null;
    lifetimeSpentThb: number | null;
  }) => {
    setVipTier((prev) => (prev === payload.vipTier ? prev : payload.vipTier));
    setCelebrationPendingTier((prev) =>
      prev === payload.celebrationPendingTier ? prev : payload.celebrationPendingTier,
    );
    setLifetimeSpentThb((prev) =>
      prev === payload.lifetimeSpentThb ? prev : payload.lifetimeSpentThb,
    );
  }, []);

  const syncLoyalty = useCallback(
    async (options?: { force?: boolean }) => {
      const force = options?.force === true;
      const now = Date.now();
      // ページリロードをまたぐ 5 分スロットル（force=true は明示的なユーザー操作のみ）
      if (!force && isRecentSyncLS()) {
        return;
      }
      if (!force && now - lastSyncStartedAtRef.current < SYNC_THROTTLE_MS) {
        return;
      }

      const pending = inFlightSyncRef.current;
      if (pending) {
        await pending;
        if (!force && Date.now() - lastSyncStartedAtRef.current < SYNC_THROTTLE_MS) {
          return;
        }
      }

      const work = (async () => {
        lastSyncStartedAtRef.current = Date.now();
        try {
          const res = await fetch("/api/auth/sync-loyalty-profile", {
            method: "POST",
            credentials: "same-origin",
          });

          if (res.status === 401) {
            applyProfilePayload({
              vipTier: null,
              celebrationPendingTier: null,
              lifetimeSpentThb: null,
            });
            return;
          }

          const json = (await res.json().catch(() => ({}))) as SyncJson;
          const parsed = res.ok ? parseSyncLoyaltyResponse(json) : null;
          if (parsed) {
            applyProfilePayload({
              vipTier: parsed.vipTier,
              celebrationPendingTier: parsed.celebrationPendingTier,
              lifetimeSpentThb: parsed.lifetimeSpentThb,
            });
            markSyncLS();
            return;
          }

          const supabase = createClient();
          const {
            data: { session: s },
          } = await supabase.auth.getSession();
          const uid = s?.user?.id;
          if (!uid) {
            applyProfilePayload({
              vipTier: null,
              celebrationPendingTier: null,
              lifetimeSpentThb: null,
            });
            return;
          }

          const { data } = await supabase
            .from("loyalty_profiles")
            .select("vip_tier, celebration_pending_tier, lifetime_spent_thb")
            .eq("auth_user_id", uid)
            .maybeSingle();
          const t = data?.vip_tier as VipTier | undefined;
          const vt =
            t === "normal" || t === "silver" || t === "gold"
              ? t
              : null;
          applyProfilePayload({
            vipTier: vt,
            celebrationPendingTier: toCelebrationTier(
              (data?.celebration_pending_tier as string | null | undefined) ?? null,
            ),
            lifetimeSpentThb:
              data?.lifetime_spent_thb != null ? Number(data.lifetime_spent_thb) : null,
          });
        } catch {
          /* ネットワーク断などではランクを消さない（状態フラップによる再同期連打を抑止）。401 は上で処理済み */
        }
      })();

      inFlightSyncRef.current = work;
      try {
        await work;
      } finally {
        if (inFlightSyncRef.current === work) {
          inFlightSyncRef.current = null;
        }
      }
    },
    [applyProfilePayload],
  );

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void (async () => {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // 5 分以内のリロードは force しない（同一セッション内の連打を防ぐ）
        await syncLoyalty({ force: !isRecentSyncLS() });
      } else {
        applyProfilePayload({
          vipTier: null,
          celebrationPendingTier: null,
          lifetimeSpentThb: null,
        });
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        applyProfilePayload({
          vipTier: null,
          celebrationPendingTier: null,
          lifetimeSpentThb: null,
        });
        setLoading(false);
        return;
      }
      if (shouldSyncLoyaltyOnAuthEvent(event)) {
        void syncLoyalty();
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [syncLoyalty, applyProfilePayload]);

  const refreshLoyalty = useCallback(async () => {
    if (!user) return;
    await syncLoyalty({ force: true });
  }, [user, syncLoyalty]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearSyncLS();
    applyProfilePayload({
      vipTier: null,
      celebrationPendingTier: null,
      lifetimeSpentThb: null,
    });
  }, [applyProfilePayload]);

  const rankBadge = useMemo(() => toRankBadge(vipTier), [vipTier]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user,
      session,
      vipTier,
      rankBadge,
      celebrationPendingTier,
      lifetimeSpentThb,
      loading,
      signOut,
      refreshLoyalty,
    }),
    [
      user,
      session,
      vipTier,
      rankBadge,
      celebrationPendingTier,
      lifetimeSpentThb,
      loading,
      signOut,
      refreshLoyalty,
    ],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}
