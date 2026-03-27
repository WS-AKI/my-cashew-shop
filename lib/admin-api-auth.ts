import { NextResponse } from "next/server";
import { ADMIN_PIN_HEADER_NAME } from "@/lib/admin-session";

/** リクエストに有効な管理PINが付いていなければ JSON エラーレスポンスを返す */
export function adminPinAuthErrorResponse(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_PIN?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "サーバーに ADMIN_PIN が設定されていません。環境変数を確認してください。" },
      { status: 500 },
    );
  }
  const pin = request.headers.get(ADMIN_PIN_HEADER_NAME)?.trim();
  if (!pin || pin !== expected) {
    return NextResponse.json(
      { error: "管理PINが違うか、送信されていません。注文管理と同じPINを入力してください。" },
      { status: 401 },
    );
  }
  return null;
}
