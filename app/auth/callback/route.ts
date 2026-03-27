import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("..")) {
    return "/";
  }
  const pathOnly = raw.split("?")[0] ?? raw;
  /** コールバックへ戻すと code なしで再入し、余計なリダイレクト・Auth 呼び出しの原因になる */
  if (pathOnly === "/auth/callback" || pathOnly.startsWith("/auth/callback/")) {
    return "/";
  }
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }
  if (!supabaseUrl || !anon) {
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  const nextUrl = new URL(next, origin);
  nextUrl.searchParams.set("auth", "success");
  let response = NextResponse.redirect(nextUrl);

  const supabase = createServerClient(supabaseUrl, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(nextUrl);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
    auth: { detectSessionInUrl: false },
  });

  // token_hash フロー: デバイスをまたいだマジックリンクに対応（code_verifier 不要）
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}&auth=failed`, origin),
      );
    }
    return response;
  }

  // PKCE コードフロー: 同一ブラウザからのリンクで利用
  const { error } = await supabase.auth.exchangeCodeForSession(code!);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}&auth=failed`, origin),
    );
  }

  return response;
}
