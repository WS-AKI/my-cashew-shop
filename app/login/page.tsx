"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAudience } from "@/context/AudienceContext";
import { DualLanguageLabel } from "@/components/ui/DualLanguageLabel";
import { Crown, Gift, Loader2, Mail } from "lucide-react";

const COPY = {
  ja: {
    eyebrow: "Members",
    title: "VIPラウンジへようこそ",
    subtitle: "お持ちのメールアドレスだけで、特別な会員特典をご利用いただけます。",
    benefitsHeading: "会員になる3つの特別なメリット",
    benefit1: "ランクアップ制度：ご購入金額に応じて Silver / Gold へ昇格",
    benefit2: "シークレット特典：VIP限定商品のご購入アクセス",
    benefit3: "パスワードレス：次回からメールだけで簡単・安全にログイン",
    emailLabel: "メールアドレス",
    emailPlaceholder: "例：name@example.com",
    passwordNote: "※面倒なパスワードの登録や暗記は一切不要です",
    submit: "メールでログイン（パスワード不要）",
    sending: "メールをお送りしています…",
    back: "ショップに戻る",
    hint: "届いたメール内のリンクをタップするだけで、すぐにお入りいただけます。",
    success: "ログイン用のメールをお送りしました。受信トレイをご確認ください。",
    errorGeneric: "送信に失敗しました。時間をおいて再度お試しください。",
    errorRateLimit: "少し時間をおいてから再度お試しください。",
    errorLinkRetry:
      "リンクの有効期限が切れたか、別の端末で開かれた可能性があります。この画面でもう一度「メールでログイン」をお試しください。",
    errorMissingCode: "ログイン用のリンクが不完全です。メールからもう一度お開きください。",
    errorConfig: "一時的に接続できませんでした。時間をおいて再度お試しください。",
    firstTimeLink: "お買い物だけの方（ログイン不要）",
  },
  th: {
    eyebrow: "Members",
    title: "ยินดีต้อนรับสู่ห้อง VIP",
    subtitle: "ใช้อีเมลของคุณเพียงอย่างเดียวเพื่อรับสิทธิพิเศษสำหรับสมาชิก",
    benefitsHeading: "3 ข้อดีพิเศษเมื่อเป็นสมาชิก",
    benefit1: "ระบบเลื่อนระดับ: ยอดซื้อสะสมพาไปสู่ Silver / Gold",
    benefit2: "สิทธิพิเศษลับ: เข้าถึงสินค้าเฉพาะ VIP",
    benefit3: "ไม่ต้องจำรหัสผ่าน: เข้าสู่ระบบง่ายและปลอดภัยด้วยอีเมล",
    emailLabel: "อีเมล",
    emailPlaceholder: "เช่น name@example.com",
    passwordNote: "※ไม่ต้องลงทะเบียนหรือจำรหัสผ่าน",
    submit: "เข้าสู่ระบบทางอีเมล (ไม่ต้องใช้รหัสผ่าน)",
    sending: "กำลังส่งอีเมล…",
    back: "กลับไปที่ร้าน",
    hint: "แค่แตะลิงก์ในอีเมลที่ส่งไป ก็เข้าใช้งานได้ทันที",
    success: "ส่งอีเมลเข้าสู่ระบบแล้ว โปรดตรวจสอบกล่องจดหมาย",
    errorGeneric: "ส่งไม่สำเร็จ โปรดลองอีกครั้งในภายหลัง",
    errorRateLimit: "โปรดรอสักครู่ก่อนลองใหม่อีกครั้ง",
    errorLinkRetry:
      "ลิงก์อาจหมดอายุหรือถูกเปิดจากอุปกรณ์อื่น กรุณาลองกดเข้าสู่ระบบทางอีเมลอีกครั้งจากหน้านี้",
    errorMissingCode: "ลิงก์เข้าสู่ระบบไม่สมบูรณ์ กรุณาเปิดจากอีเมลอีกครั้ง",
    errorConfig: "เชื่อมต่อไม่ได้ชั่วคราว กรุณาลองใหม่ภายหลัง",
    firstTimeLink: "แค่ช้อปปิ้ง (ไม่ต้องเข้าสู่ระบบ)",
  },
} as const;

function isRateLimitError(msg: string): boolean {
  const text = msg.toLowerCase();
  return (
    text.includes("rate") ||
    text.includes("too many") ||
    text.includes("over_email_send_rate_limit")
  );
}

type AuthCopy = {
  errorLinkRetry: string;
  errorMissingCode: string;
  errorConfig: string;
};

function getFriendlyAuthError(raw: string, t: AuthCopy): string {
  const text = raw.toLowerCase();
  if (
    text.includes("pkce code verifier not found") ||
    text.includes("flow was initiated in a different browser") ||
    text.includes("storage was cleared")
  ) {
    return t.errorLinkRetry;
  }
  if (text.includes("missing_code")) return t.errorMissingCode;
  if (text.includes("config")) return t.errorConfig;
  if (text.includes("expired") || text.includes("otp_expired") || text.includes("invalid token")) {
    return t.errorLinkRetry;
  }
  return raw;
}

const BENEFIT_ICONS = [Crown, Gift, Mail] as const;

export default function LoginPage() {
  const audience = useAudience();
  const t = COPY[audience];
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback`;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("error");
    if (p) {
      setMessage({ type: "err", text: getFriendlyAuthError(decodeURIComponent(p), t) });
    }
  }, [t]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const trimmed = email.trim();
    if (!trimmed) return;

    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) {
        setMessage({ type: "err", text: isRateLimitError(error.message) ? t.errorRateLimit : error.message });
      } else {
        setMessage({ type: "ok", text: t.success });
      }
    } catch {
      setMessage({ type: "err", text: t.errorGeneric });
    } finally {
      setBusy(false);
    }
  }

  const benefits = [
    { Icon: BENEFIT_ICONS[0], primary: t.benefit1, secondary: audience === "ja" ? COPY.th.benefit1 : COPY.ja.benefit1 },
    { Icon: BENEFIT_ICONS[1], primary: t.benefit2, secondary: audience === "ja" ? COPY.th.benefit2 : COPY.ja.benefit2 },
    { Icon: BENEFIT_ICONS[2], primary: t.benefit3, secondary: audience === "ja" ? COPY.th.benefit3 : COPY.ja.benefit3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-[480px]">
          {/* レセプション風：歓迎ヘッダー */}
          <div className="text-center mb-8 sm:mb-10 space-y-3">
            <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" aria-hidden />
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.42em] text-amber-900/45 font-medium">
              {t.eyebrow}
            </p>
            <h1 className="text-[1.65rem] sm:text-[1.85rem] font-semibold text-[#2c2419] tracking-tight leading-snug">
              <DualLanguageLabel primary={t.title} secondary={audience === "ja" ? COPY.th.title : COPY.ja.title} />
            </h1>
            <p className="text-[15px] sm:text-base text-[#5c4d3d]/90 leading-relaxed max-w-md mx-auto px-1">
              <DualLanguageLabel primary={t.subtitle} secondary={audience === "ja" ? COPY.th.subtitle : COPY.ja.subtitle} />
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#e8dfd4] bg-white shadow-[0_32px_64px_-32px_rgba(44,36,25,0.18)] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-200/60 via-amber-600/35 to-amber-200/60" aria-hidden />

            <div className="px-6 sm:px-9 pt-8 pb-2">
              <p className="text-center text-[13px] sm:text-sm font-medium text-[#3d3429] tracking-wide mb-5">
                <DualLanguageLabel
                  primary={t.benefitsHeading}
                  secondary={audience === "ja" ? COPY.th.benefitsHeading : COPY.ja.benefitsHeading}
                />
              </p>
              <ul className="space-y-4 mb-8" aria-label={t.benefitsHeading}>
                {benefits.map(({ Icon, primary, secondary }, i) => (
                  <li key={i} className="flex gap-3.5 items-start">
                    <span
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-[#faf6f0] text-amber-800"
                      aria-hidden
                    >
                      <Icon className="h-[1.15rem] w-[1.15rem] stroke-[1.35]" />
                    </span>
                    <p className="text-[15px] sm:text-base leading-relaxed text-[#3d3429] pt-1">
                      <DualLanguageLabel primary={primary} secondary={secondary} />
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#ebe3d8] px-6 sm:px-9 py-8 sm:py-9 bg-[#fdfcfa]">
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[15px] sm:text-base font-medium text-[#3d3429] mb-2.5"
                  >
                    <DualLanguageLabel
                      primary={t.emailLabel}
                      secondary={audience === "ja" ? COPY.th.emailLabel : COPY.ja.emailLabel}
                    />
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-900/35 pointer-events-none"
                      aria-hidden
                    />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full rounded-2xl border-2 border-[#c9b8a4] bg-white pl-12 pr-4 py-4 text-base sm:text-[17px] text-[#2c2419] placeholder:text-[#8a7d6e]/55 outline-none transition-shadow focus:border-amber-700 focus:ring-2 focus:ring-amber-200/70 focus:ring-offset-2"
                    />
                  </div>
                  <p className="mt-2.5 text-[13px] sm:text-sm text-[#6b5d4d] leading-relaxed">{t.passwordNote}</p>
                </div>

                {message && (
                  <p
                    role="status"
                    className={`text-[15px] leading-relaxed ${
                      message.type === "ok" ? "text-emerald-800" : "text-red-800"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-2xl bg-[#3d2f24] py-4 text-base sm:text-[17px] font-semibold text-[#faf8f5] shadow-md transition hover:bg-[#2c2219] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c4d3d]"
                >
                  {busy ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
                      {t.sending}
                    </span>
                  ) : (
                    t.submit
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-[14px] sm:text-[15px] text-[#6b5d4d] leading-relaxed">{t.hint}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <Link
              href="/"
              className="text-[15px] sm:text-base text-[#5c4d3d] underline-offset-[5px] decoration-[#c9b8a4] hover:decoration-amber-800 hover:text-[#3d3429] transition-colors underline"
            >
              {t.back}
            </Link>
            <Link
              href="/#products"
              className="text-[12px] sm:text-[13px] text-[#8a7d6e]/90 hover:text-[#6b5d4d] transition-colors underline-offset-2 hover:underline"
            >
              <DualLanguageLabel
                primary={COPY.ja.firstTimeLink}
                secondary={audience === "ja" ? COPY.th.firstTimeLink : COPY.ja.firstTimeLink}
              />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
