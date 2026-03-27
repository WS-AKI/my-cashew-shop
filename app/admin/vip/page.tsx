"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Loader2, Search, Sparkles, TestTube2 } from "lucide-react";
import { ADMIN_API_PIN_SESSION_KEY, adminApiPinHeaders } from "@/lib/admin-session";
import { verifyAdminPinWithServer } from "@/lib/admin-verify-pin-client";

type Tier = "normal" | "silver" | "gold";

type ProfileRow = {
  id: string;
  email_normalized: string | null;
  auth_user_id: string | null;
  vip_tier: Tier;
  lifetime_spent_thb: number | null;
  celebration_pending_tier: "silver" | "gold" | null;
  tier_cycle_started_at: string | null;
  tier_expires_at: string | null;
  updated_at: string | null;
};

type UserChoice = {
  id: string;
  email_normalized: string | null;
  vip_tier: Tier;
  updated_at: string | null;
};

type Action =
  | "get_profile"
  | "set_celebration"
  | "clear_celebration"
  | "set_tier"
  | "add_lifetime_adjustment";

function tierChipClass(tier: Tier) {
  if (tier === "gold") return "bg-amber-100 text-amber-800 border-amber-300";
  if (tier === "silver") return "bg-slate-100 text-slate-700 border-slate-300";
  return "bg-zinc-100 text-zinc-600 border-zinc-300";
}

export default function AdminVipPage() {
  const [apiPin, setApiPin] = useState<string | null>(null);
  const [pinDraft, setPinDraft] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserChoice[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [adjustmentThb, setAdjustmentThb] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(ADMIN_API_PIN_SESSION_KEY);
      if (stored) setApiPin(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.email_normalized ?? "").includes(q));
  }, [search, users]);

  const canRun = Boolean(apiPin && selectedEmail.trim());
  const canAdjust =
    canRun &&
    adjustmentThb.trim() !== "" &&
    Number.isFinite(Number(adjustmentThb));
  const tierLabel = useMemo(() => {
    const t = profile?.vip_tier;
    if (!t) return "-";
    if (t === "gold") return "Gold";
    if (t === "silver") return "Silver";
    return "Normal";
  }, [profile?.vip_tier]);

  async function fetchChoices(pin: string) {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/loyalty/test-users", {
        headers: adminApiPinHeaders(pin),
        credentials: "same-origin",
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        users?: UserChoice[];
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? `ユーザー一覧取得エラー (${res.status})`);
        return;
      }
      setUsers(json.users ?? []);
      if (!selectedEmail && json.users && json.users.length > 0) {
        const first = json.users.find((u) => u.email_normalized)?.email_normalized;
        if (first) setSelectedEmail(first);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setUsersLoading(false);
    }
  }

  async function verifyAndStorePin() {
    const p = pinDraft.trim();
    setPinBusy(true);
    setError(null);
    try {
      const result = await verifyAdminPinWithServer(p);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      sessionStorage.setItem(ADMIN_API_PIN_SESSION_KEY, p);
      setApiPin(p);
      setPinDraft("");
      setMessage("管理PINを確認しました。VIPテストを実行できます。");
      await fetchChoices(p);
    } catch (e) {
      setError(String(e));
    } finally {
      setPinBusy(false);
    }
  }

  function clearStoredPin() {
    sessionStorage.removeItem(ADMIN_API_PIN_SESSION_KEY);
    setApiPin(null);
    setMessage("PINをクリアしました。");
  }

  async function run(action: Action, extra: Record<string, unknown> = {}) {
    if (!apiPin) {
      setError("先に管理PINを確認してください。");
      return;
    }
    if (!selectedEmail.trim()) {
      setError("確認したい会員を選択してください。");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/loyalty/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminApiPinHeaders(apiPin),
        },
        credentials: "same-origin",
        body: JSON.stringify({
          action,
          email: selectedEmail.trim().toLowerCase(),
          ...extra,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        profile?: ProfileRow;
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? `実行エラー (${res.status})`);
        return;
      }
      if (json.profile) setProfile(json.profile);
      setMessage("実行しました。");
      await fetchChoices(apiPin);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const loyaltyTestUiEnabled =
    process.env.NEXT_PUBLIC_ENABLE_ADMIN_LOYALTY_TEST_TOOLS === "true";

  if (!loyaltyTestUiEnabled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <TestTube2 className="mx-auto text-slate-300 mb-3" size={32} />
          <h1 className="font-bold text-slate-800">VIP 検証ツールは無効です</h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            本番ではランク強制切替 API を開けません。開発用に{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">NEXT_PUBLIC_ENABLE_ADMIN_LOYALTY_TEST_TOOLS=true</code>{" "}
            （画面表示）と{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">ENABLE_ADMIN_LOYALTY_TEST_TOOLS=true</code>{" "}
            （API・必須）を .env / Cloudflare に設定した環境でのみ利用してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TestTube2 size={20} className="text-violet-500" />
            VIP検証
            <span className="text-slate-400 font-normal text-sm">· ทดสอบ VIP</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            SQLなしで招待状モーダル（Silver/Gold）やランク切替を確認できます。
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800">管理PIN（注文管理と同じ）</p>
          {apiPin ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <Sparkles size={13} />
                PIN確認済み
              </span>
              <button
                type="button"
                onClick={clearStoredPin}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                PINをクリア
              </button>
              <button
                type="button"
                onClick={() => void fetchChoices(apiPin)}
                disabled={usersLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-60"
              >
                {usersLoading ? "更新中..." : "ユーザー一覧を更新"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value)}
                placeholder="管理PIN"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void verifyAndStorePin()}
                disabled={pinBusy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
              >
                {pinBusy ? <Loader2 size={14} className="animate-spin" /> : null}
                PINを確認
              </button>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Crown size={16} className="text-amber-500" />
            1) 対象会員を選ぶ
          </p>

          <div className="space-y-3">
            <div className="relative w-full sm:w-[28rem]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="メールで検索"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden max-h-52 overflow-y-auto">
              {usersLoading ? (
                <div className="px-3 py-4 text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  ユーザー一覧を読み込み中...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-3 py-4 text-sm text-slate-500">対象ユーザーが見つかりません。</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const email = u.email_normalized ?? "";
                    const active = selectedEmail === email;
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedEmail(email)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${active ? "bg-violet-50" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700 truncate">{email}</span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tierChipClass(u.vip_tier)}`}>
                              {u.vip_tier.toUpperCase()}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => void run("get_profile")}
              disabled={!canRun || loading}
              className="rounded-xl bg-slate-700 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
            >
              読み込み
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-slate-500">選択中メール</p>
              <p className="text-slate-800 font-semibold mt-0.5 break-all">{selectedEmail || "-"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-slate-500">現在ランク</p>
              <p className="text-slate-800 font-semibold mt-0.5">{tierLabel}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-slate-500">お祝いフラグ</p>
              <p className="text-slate-800 font-semibold mt-0.5">{profile?.celebration_pending_tier ?? "null"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-slate-500">累計購入額</p>
              <p className="text-slate-800 font-semibold mt-0.5">฿{Number(profile?.lifetime_spent_thb ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-800">2) モーダル表示をテスト</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void run("set_celebration", { celebrationTier: "silver" })}
              disabled={!canRun || loading}
              className="rounded-xl bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-900 disabled:opacity-60"
            >
              Silver招待状を再表示
            </button>
            <button
              type="button"
              onClick={() => void run("set_celebration", { celebrationTier: "gold" })}
              disabled={!canRun || loading}
              className="rounded-xl bg-amber-700 text-white text-sm font-medium px-4 py-2 hover:bg-amber-800 disabled:opacity-60"
            >
              Gold招待状を再表示
            </button>
            <button
              type="button"
              onClick={() => void run("clear_celebration")}
              disabled={!canRun || loading}
              className="rounded-xl bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-300 disabled:opacity-60"
            >
              お祝いフラグをクリア
            </button>
          </div>
          <p className="text-xs text-slate-500">実行後に対象ユーザーでログイン中のブラウザをリロードすると、モーダル表示を確認できます。</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-800">3) ランク切替をテスト</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void run("set_tier", { tier: "normal", lifetimeSpentThb: 0 })}
              disabled={!canRun || loading}
              className="rounded-xl bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-300 disabled:opacity-60"
            >
              Normalに変更
            </button>
            <button
              type="button"
              onClick={() => void run("set_tier", { tier: "silver", lifetimeSpentThb: 6000 })}
              disabled={!canRun || loading}
              className="rounded-xl bg-slate-700 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
            >
              Silverに変更（6,000 THB）
            </button>
            <button
              type="button"
              onClick={() => void run("set_tier", { tier: "gold", lifetimeSpentThb: 16000 })}
              disabled={!canRun || loading}
              className="rounded-xl bg-amber-700 text-white text-sm font-medium px-4 py-2 hover:bg-amber-800 disabled:opacity-60"
            >
              Goldに変更（16,000 THB）
            </button>
          </div>
          <p className="text-xs text-slate-500">ゴールド限定商品のロック確認は、Normal/Silver/Goldに切り替えて商品ページをリロードして比べると分かりやすいです。</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-800">
            4) システム外売上の手動反映（加算/減算）
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            累計購入額は直接上書きせず、必ず「加算」で調整します。負数（例: -500）を入力すると減算として扱われます。
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={adjustmentThb}
              onChange={(e) => setAdjustmentThb(e.target.value)}
              placeholder="例: 2500 / -500"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-56"
            />
            <button
              type="button"
              onClick={() =>
                void run("add_lifetime_adjustment", {
                  adjustmentThb: Number(adjustmentThb),
                })
              }
              disabled={!canAdjust || loading}
              className="rounded-xl bg-emerald-700 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-800 disabled:opacity-60"
            >
              金額を追加する
            </button>
          </div>
          <p className="text-xs text-slate-500">
            実行後、最新の lifetime と VIPランク（Normal/Silver/Gold）が自動再判定され、昇格/降格処理（お祝いフラグ含む）が反映されます。
          </p>
        </section>

        {error ? <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div> : null}
        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-4 py-3">{message}</div> : null}
      </div>
    </div>
  );
}
