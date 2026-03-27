"use client";

import Link from "next/link";
import { CircleUserRound, Globe, LogIn, LogOut, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAudience } from "@/context/AudienceContext";
import { useAuthSessionOptional } from "@/context/AuthSessionContext";
import { useLanguage } from "@/context/LanguageContext";
import LoyaltyRankBadge from "@/components/loyalty/LoyaltyRankBadge";
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

export default function Header() {
  const { totalQuantity } = useCart();
  const audience = useAudience();
  const auth = useAuthSessionOptional();
  const { language, setLanguage, t } = useLanguage();
  const authNav = AUTH_NAV[audience];
  const authStatusLabel = AUTH_STATUS[audience];

  return (
    <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b border-amber-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🥜</span>
          <div>
            <p className="font-bold text-amber-900 text-base leading-tight tracking-tight group-hover:text-amber-700 transition-colors">
              Sam Sian
              <span className="text-amber-500"> Cashew Nuts</span>
            </p>
            <p className="text-amber-600/70 text-[10px] leading-none tracking-widest uppercase">
              Uttaradit, Thailand
            </p>
          </div>
        </Link>

        {/* ナビ */}
        <nav className="hidden sm:flex items-center gap-7 text-[13px] font-medium tracking-[0.01em] text-amber-900/80">
          <Link href="/" className="hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.home : Nav.home[audience]}
          </Link>
          <Link href="/products" className="hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.products : Nav.products[audience]}
          </Link>
          <Link href="/about" className="hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.about : Nav.about[audience]}
          </Link>
          <Link href="/track" className="hover:text-amber-600 transition-colors">
            {language === "en" ? t.nav.track : Nav.track[audience]}
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {auth && !auth.loading && (
            <>
              {auth.user ? (
                <Link href="/account/vip" aria-label={audience === "ja" ? "VIPページへ" : "ไปยังหน้า VIP"}>
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

        {/* JP / EN 言語トグル */}
        <button
          type="button"
          onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
          className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-900/50 hover:text-amber-700 transition-colors select-none"
          aria-label={language === "ja" ? "Switch to English" : "日本語に切り替え"}
          title={language === "ja" ? "Switch to English" : "日本語に切り替え"}
        >
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{language === "ja" ? "EN" : "JP"}</span>
          <span className="sm:hidden">{language.toUpperCase()}</span>
        </button>

        {/* カートアイコン */}
        <Link href="/cart" className="relative p-2 group">
          <ShoppingCart
            size={24}
            className="text-amber-800 group-hover:text-amber-600 transition-colors"
          />
          {totalQuantity > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none animate-bounce">
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </span>
          )}
        </Link>
        </div>
      </div>
    </header>
  );
}
