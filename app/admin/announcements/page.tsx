"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_API_PIN_SESSION_KEY, adminApiPinHeaders } from "@/lib/admin-session";
import { verifyAdminPinWithServer } from "@/lib/admin-verify-pin-client";
import { CalendarDays, Check, ImageUp, KeyRound, Loader2, Megaphone, RefreshCw } from "lucide-react";

type AnnouncementRow = {
  id: string;
  title_ja: string | null;
  body_ja: string | null;
  title_th: string | null;
  body_th: string | null;
  image_url: string | null;
  display_start: string | null;
  display_end: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type FormData = {
  id: string | null;
  title_ja: string;
  body_ja: string;
  title_th: string;
  body_th: string;
  image_url: string;
  display_start: string;
  display_end: string;
  is_active: boolean;
};

const TEMPLATE_OPTIONS = [
  { value: "", label: "テンプレートを選択" },
  { value: "holiday", label: "休業のお知らせ" },
  { value: "shipping-delay", label: "配送遅延のお知らせ" },
] as const;

const TEMPLATES = {
  holiday: {
    title_ja: "休業期間のお知らせ",
    body_ja:
      "いつもご利用ありがとうございます。\n\n下記期間は休業のため、発送・お問い合わせ対応を停止いたします。\n休業明けより順次対応いたしますので、何卒ご了承ください。",
    title_th: "ประกาศวันหยุดให้บริการ",
    body_th:
      "ขอขอบคุณที่ใช้บริการของเรา\n\nในช่วงวันหยุดตามกำหนด เราจะหยุดการจัดส่งและการตอบกลับชั่วคราว\nจะทยอยดำเนินการตามลำดับหลังวันหยุด ขออภัยในความไม่สะดวก",
  },
  "shipping-delay": {
    title_ja: "配送遅延のお知らせ",
    body_ja:
      "現在、ご注文が集中しているため通常より発送までお時間をいただいております。\n\n順次発送しておりますので、到着まで今しばらくお待ちください。",
    title_th: "ประกาศความล่าช้าในการจัดส่ง",
    body_th:
      "ขณะนี้มีคำสั่งซื้อจำนวนมาก ทำให้การจัดส่งล่าช้ากว่าปกติ\n\nทีมงานกำลังทยอยจัดส่งตามลำดับ ขอความกรุณารอสินค้าอีกเล็กน้อย",
  },
} as const;

function toDatetimeLocalValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function toFormData(row: AnnouncementRow | null): FormData {
  if (!row) {
    return {
      id: null,
      title_ja: "",
      body_ja: "",
      title_th: "",
      body_th: "",
      image_url: "",
      display_start: "",
      display_end: "",
      is_active: true,
    };
  }
  return {
    id: row.id,
    title_ja: row.title_ja ?? "",
    body_ja: row.body_ja ?? "",
    title_th: row.title_th ?? "",
    body_th: row.body_th ?? "",
    image_url: row.image_url ?? "",
    display_start: toDatetimeLocalValue(row.display_start),
    display_end: toDatetimeLocalValue(row.display_end),
    is_active: Boolean(row.is_active),
  };
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  /** お知らせAPI用（sessionStorage と同期）。注文管理でPIN成功時も自動セットされる */
  const [apiPin, setApiPin] = useState<string | null>(null);
  const [pinDraft, setPinDraft] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof TEMPLATE_OPTIONS)[number]["value"]>("");
  const [form, setForm] = useState<FormData>(toFormData(null));
  const [imagePreview, setImagePreview] = useState("");
  const [rawUpdatedAt, setRawUpdatedAt] = useState<string | null>(null);

  const isBusy = saving || uploading;
  const isApiPinReady = Boolean(apiPin);
  const updatedAtText = useMemo(() => {
    if (!rawUpdatedAt) return "未保存";
    const d = new Date(rawUpdatedAt);
    if (Number.isNaN(d.getTime())) return "未保存";
    return d.toLocaleString("ja-JP");
  }, [rawUpdatedAt]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(ADMIN_API_PIN_SESSION_KEY);
      if (stored) setApiPin(stored);
    } catch {
      /* sessionStorage 不可 */
    }
  }, []);

  const fetchAnnouncement = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("announcements")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (fetchError) {
      setError(`読み込みエラー: ${fetchError.message}`);
      setLoading(false);
      return;
    }
    const row = (data ?? null) as AnnouncementRow | null;
    const nextForm = toFormData(row);
    setForm(nextForm);
    setImagePreview(nextForm.image_url);
    setRawUpdatedAt(row?.updated_at ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchAnnouncement();
    });
  }, [fetchAnnouncement]);

  const applyTemplate = (templateKey: string) => {
    if (!templateKey || !(templateKey in TEMPLATES)) return;
    const t = TEMPLATES[templateKey as keyof typeof TEMPLATES];
    setForm((prev) => ({
      ...prev,
      title_ja: t.title_ja,
      body_ja: t.body_ja,
      title_th: t.title_th,
      body_th: t.body_th,
    }));
    setSuccess("テンプレートを反映しました。必要に応じて編集して保存してください。");
    setError(null);
  };

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (!apiPin) {
        setError("先に管理PINを確認してください。");
        return null;
      }
      const res = await fetch("/api/admin/announcements/upload", {
        method: "POST",
        headers: adminApiPinHeaders(apiPin),
        body: fd,
        credentials: "same-origin",
      });
      const json = (await res.json()) as { publicUrl?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? `画像アップロードエラー (${res.status})`);
        return null;
      }
      if (!json.publicUrl) {
        setError("画像URLの取得に失敗しました。");
        return null;
      }
      return json.publicUrl;
    } catch (err) {
      setError(`画像アップロード中にエラーが発生しました: ${String(err)}`);
      return null;
    } finally {
      setUploading(false);
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
      setSuccess("管理PINを確認しました。保存・画像アップロードが可能です。");
    } catch (e) {
      setError(String(e));
    } finally {
      setPinBusy(false);
    }
  }

  function clearStoredPin() {
    sessionStorage.removeItem(ADMIN_API_PIN_SESSION_KEY);
    setApiPin(null);
    setSuccess(null);
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください。");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("画像サイズは10MB以下にしてください。");
      return;
    }
    const publicUrl = await uploadImage(file);
    if (!publicUrl) return;
    setForm((prev) => ({ ...prev, image_url: publicUrl }));
    setImagePreview(publicUrl);
    setSuccess("画像をアップロードしました。保存を押すと反映されます。");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!form.title_ja.trim() || !form.body_ja.trim()) {
      setSaving(false);
      setError("日本語タイトルと本文は必須です。");
      return;
    }

    const startIso = toIsoOrNull(form.display_start);
    const endIso = toIsoOrNull(form.display_end);
    if (startIso && endIso && new Date(startIso).getTime() > new Date(endIso).getTime()) {
      setSaving(false);
      setError("表示終了日時は開始日時より後に設定してください。");
      return;
    }

    const payload = {
      id: form.id,
      title_ja: form.title_ja.trim(),
      body_ja: form.body_ja.trim(),
      title_th: form.title_th.trim() || null,
      body_th: form.body_th.trim() || null,
      image_url: form.image_url.trim() || null,
      display_start: startIso,
      display_end: endIso,
      is_active: form.is_active,
    };

    if (!apiPin) {
      setSaving(false);
      setError("先に管理PINを確認してください。");
      return;
    }

    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminApiPinHeaders(apiPin),
      },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });
    const json = (await res.json()) as { ok?: boolean; id?: string | null; error?: string };

    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? `保存エラー (${res.status})`);
      return;
    }
    setSuccess("お知らせを保存しました。");
    setForm((prev) => ({ ...prev, id: json.id ?? prev.id }));
    router.refresh();
    await fetchAnnouncement();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Megaphone size={20} className="text-violet-500" />
              お知らせ管理
              <span className="text-slate-400 font-normal text-sm ml-1">· จัดการประกาศ</span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">最終更新: {updatedAtText}</p>
          </div>
          <button
            type="button"
            onClick={fetchAnnouncement}
            disabled={loading || isBusy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            更新
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={34} className="animate-spin text-violet-500 mb-3" />
            <p className="text-sm">読み込み中…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <KeyRound size={16} className="text-emerald-600" />
                管理PIN（注文管理と同じ）
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                管理PIN（<code className="bg-slate-100 rounded px-1 text-xs">ADMIN_PIN</code>）を入力してください。注文管理でログイン済みなら自動で引き継がれます。ブラウザのタブを閉じると再入力が必要です。
              </p>
              {isApiPinReady ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-emerald-700 font-medium">管理PIN: 確認済み</p>
                  <button
                    type="button"
                    onClick={clearStoredPin}
                    className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
                  >
                    PINを忘れて再入力
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={pinDraft}
                    onChange={(e) => setPinDraft(e.target.value)}
                    placeholder="管理PIN"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void verifyAndStorePin()}
                    disabled={pinBusy}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-sm disabled:opacity-60 shrink-0"
                  >
                    {pinBusy ? "確認中…" : "PINを確認"}
                  </button>
                </div>
              )}
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <section className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-sm font-semibold text-violet-900">テンプレートから入力</p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    const value = e.target.value as (typeof TEMPLATE_OPTIONS)[number]["value"];
                    setSelectedTemplate(value);
                    applyTemplate(value);
                  }}
                  className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {TEMPLATE_OPTIONS.map((item) => (
                    <option key={item.value || "empty"} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">タイトル（日本語）*</label>
                <input
                  type="text"
                  value={form.title_ja}
                  onChange={(e) => setForm((prev) => ({ ...prev, title_ja: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="例: 年末年始の営業について"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">本文（日本語）*</label>
                <textarea
                  value={form.body_ja}
                  onChange={(e) => setForm((prev) => ({ ...prev, body_ja: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y min-h-28"
                  placeholder="表示したいお知らせ本文"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">タイトル（タイ語）</label>
                <input
                  type="text"
                  value={form.title_th}
                  onChange={(e) => setForm((prev) => ({ ...prev, title_th: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="ตัวอย่าง: แจ้งวันหยุดช่วงปีใหม่"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">本文（タイ語）</label>
                <textarea
                  value={form.body_th}
                  onChange={(e) => setForm((prev) => ({ ...prev, body_th: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y min-h-28"
                  placeholder="ข้อความประกาศภาษาไทย"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">画像URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({ ...prev, image_url: val }));
                    setImagePreview(val);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy || !isApiPinReady}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-60"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageUp size={16} />}
                  画像アップロード
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-xs text-slate-500">Supabase Storage: `announcement-images`</span>
              </div>
              {imagePreview && (
                <div className="relative w-full max-w-md aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element -- トップポップアップと同じく Workers 本番で確実に表示 */}
                  <img
                    src={imagePreview}
                    alt="announcement preview"
                    className="absolute inset-0 h-full w-full object-contain p-2"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              )}
            </section>

            <section className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="inline-flex items-center gap-1"><CalendarDays size={14} />表示開始</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.display_start}
                  onChange={(e) => setForm((prev) => ({ ...prev, display_start: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="inline-flex items-center gap-1"><CalendarDays size={14} />表示終了</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.display_end}
                  onChange={(e) => setForm((prev) => ({ ...prev, display_end: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">ポップアップを有効化</p>
                <p className="text-xs text-slate-500 mt-0.5">{form.is_active ? "表示中（期間内のみ公開）" : "手動で非表示"}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${form.is_active ? "bg-violet-500" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-7" : "translate-x-0"}`}
                />
              </button>
            </section>

            <button
              type="submit"
              disabled={isBusy || !isApiPinReady}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              保存する
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
