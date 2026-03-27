import { adminApiPinHeaders } from "@/lib/admin-session";

/**
 * 管理 PIN をサーバー（ADMIN_PIN 環境変数）と照合する。
 * 注文管理・お知らせ・VIP 検証で共通利用し、クライアント側のハードコードとズレないようにする。
 */
export async function verifyAdminPinWithServer(
  pin: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const p = pin.trim();
  if (!p) {
    return { ok: false, message: "管理PINを入力してください。" };
  }
  const res = await fetch("/api/admin/ping", {
    headers: adminApiPinHeaders(p),
    credentials: "same-origin",
  });
  const raw = await res.text();
  let json: { error?: string } = {};
  try {
    json = JSON.parse(raw) as { error?: string };
  } catch {
    /* 500 HTML 等 */
  }
  if (!res.ok) {
    if (json.error) {
      return { ok: false, message: json.error };
    }
    if (res.status === 401) {
      return {
        ok: false,
        message:
          "管理PINが違います。Cloudflare の ADMIN_PIN（.env の ADMIN_PIN）と同じ値を入力してください。",
      };
    }
    if (res.status === 500) {
      return {
        ok: false,
        message:
          "サーバー設定エラーです。Workers に ADMIN_PIN が設定されているか確認してください。",
      };
    }
    return { ok: false, message: `PINの確認に失敗しました（HTTP ${res.status}）。` };
  }
  return { ok: true };
}
