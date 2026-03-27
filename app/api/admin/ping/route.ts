import { NextResponse } from "next/server";
import { adminPinAuthErrorResponse } from "@/lib/admin-api-auth";

/** 管理PINだけ検証（お知らせ画面で「PINを確認」用） */
export async function GET(request: Request) {
  const authErr = adminPinAuthErrorResponse(request);
  if (authErr) return authErr;
  return NextResponse.json({ ok: true });
}
