import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Cloudflare Workers の CPU 制限対策:
 * - /auth/callback は route 内で exchangeCodeForSession / verifyOtp するため middleware を通さない
 *   （ここで getUser すると Supabase 往復がコールバック前後で二重化しやすい）。
 * - /api/auth/* は middleware を重ねない（Route 内で getSession のみ）。
 */
export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/login",
    "/checkout",
    "/checkout/:path*",
  ],
};
