"use client";

import Link from "next/link";
import { CircleUserRound, LogIn, LogOut, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAudience } from "@/context/AudienceContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import { useLanguage } from "@/context/LanguageContext";
import LoyaltyRankBadge from "@/components/loyalty/LoyaltyRankBadge";
import {
  SamSianAppLauncherIconMark,
  SamSianCashewWordmarkHeader,
} from "@/components/brand/SamSianCashewLockup";
import { SHOP_TEXT } from "@/lib/shop-config";

const Nav = SHOP_TEXT.nav;

const AUTH_NAV = {
  ja: { signIn: "会員ログイン", signOut: "ログアウト" },
  th: { signIn: "เข้าสู่ระบบสมาชิก", signOut: "ออกจากระบบ" },
} as const;

const AUTH_STATUS = {
  ja: "ログイン中",
  th: "เข้าสู่ระบบแล้ว",
} as const;

const VIP_ARIA = {
  ja: "VIPページへ",
  th: "ไปยังหน้า VIP",
} as const;

export default function Header() {
  const { totalQuantity } = useCart();
  const audience = useAudience();
  const auth = useAuthSessionOptional();
  const { language, setLanguage, t } = useLanguage();
  const isEn = language === "en";
  const authNav = isEn
    ? { signIn: t.header.signIn, signOut: t.header.signOut }
    : AUTH_NAV[audience];
  const authStatusLabel = isEn ? t.header.loggedIn : AUTH_STATUS[audience];
  const vipAriaLabel = isEn ? t.header.vipPageAriaLabel : VIP_ARIA[audience];
  const langSwitchAria = isEn ? t.header.languageSwitchAria : "言語切り替え / Language";

  const cartAriaLabel = isEn ? t.footer.cart : "カート";

  return (
    <header className="sticky top-0 z-40 bg-amber-50/95 backdrop-blur-md border-b border-amber-100/80 shadow-[0_1px_0_rgba(120,53,15,0.04)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-[76px] py-2.5 flex items-center justify-between gap-2 sm:gap-5">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
          <SamSianAppLauncherIconMark
            className="h-10 w-10 sm:h-11 sm:w-11 transition-transform duration-300 group-hover:scale-[1.06]"
            imgSizes="(max-width: 640px) 40px, 44px"
            priority
          />
          <div className="hidden sm:block">
            <SamSianCashewWordmarkHeader />
          </div>
        </Link>

        {/* ナビ */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-[13px] font-medium tracking-[0.01em] text-amber-900/80">
          <Link href="/" className="whitespace-nowrap hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.home : Nav.home[audience]}
          </Link>
          <Link href="/products" className="whitespace-nowrap hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.products : Nav.products[audience]}
          </Link>
          <Link href="/about" className="whitespace-nowrap hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.about : Nav.about[audience]}
          </Link>
          <Link href="/track" className="whitespace-nowrap hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.track : Nav.track[audience]}
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2.5 md:gap-4 shrink-0 min-w-0">
          {/* カート: スマホでは先頭に配置して画面外に切れないようにする */}
          <Link
            href="/cart"
            aria-label={cartAriaLabel}
            className="relative shrink-0 p-1.5 sm:p-2 group order-first md:order-last"
          >
            <ShoppingCart
              size={22}
              className="sm:w-6 sm:h-6 text-amber-800 group-hover:text-amber-600 transition-colors"
            />
            {totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold min-w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-full flex items-center justify-center leading-none px-0.5 animate-bounce">
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </span>
            )}
          </Link>

          {auth && !auth.loading && (
            <>
              {auth.user ? (
                <Link href="/account/vip" aria-label={vipAriaLabel}>
                  <LoyaltyRankBadge tier={auth.vipTier ?? "normal"} />
                </Link>
              ) : null}
              {auth.user ? (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div
                    className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1"
                    aria-label={authStatusLabel}
                    title={authStatusLabel}
                  >
                    <div className="relative">
                      <CircleUserRound className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
                      <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-50" />
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700">{authStatusLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void auth.signOut()}
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-900/50 hover:text-amber-900/80 transition-colors tracking-wide"
                    aria-label={authNav.signOut}
                  >
                    <LogOut className="h-3.5 w-3.5 opacity-70" aria-hidden />
                    <span className="hidden sm:inline">{authNav.signOut}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-900/50 hover:text-amber-900/80 transition-colors tracking-wide"
                >
                  <LogIn className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  <span className="hidden sm:inline">{authNav.signIn}</span>
                </Link>
              )}
            </>
          )}

        {/* 言語切り替え: 切り替え先を強調 */}
        <div
          className="flex items-center divide-x divide-amber-200 shrink min-w-0"
          role="group"
          aria-label={langSwitchAria}
        >
          <button
            type="button"
            onClick={() => setLanguage("en")}
            disabled={language === "en"}
            aria-current={language === "en" ? "true" : undefined}
            aria-label="Switch to English"
            className={`
              min-h-[40px] sm:min-h-[44px] px-1.5 sm:px-2.5 flex items-center transition-all duration-150 select-none
              text-[10px] sm:text-xs tracking-wide
              ${language === "en"
                ? "font-medium text-amber-900/30 cursor-default"
                : "font-extrabold text-amber-800 hover:text-amber-600 active:scale-95"
              }
            `}
          >
            <span className="sm:hidden">EN</span>
            <span className="hidden sm:inline">English</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ja")}
            disabled={language === "ja"}
            aria-current={language === "ja" ? "true" : undefined}
            aria-label="日本語に切り替え"
            className={`
              min-h-[40px] sm:min-h-[44px] px-1.5 sm:px-2.5 flex items-center transition-all duration-150 select-none
              text-[10px] sm:text-xs tracking-wide
              ${language === "ja"
                ? "font-medium text-amber-900/30 cursor-default"
                : "font-extrabold text-amber-800 hover:text-amber-600 active:scale-95"
              }
            `}
          >
            日本語
          </button>
        </div>
        </div>
      </div>
    </header>
  );
}
