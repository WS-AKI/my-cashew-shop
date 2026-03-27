"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ja, type Locale } from "@/lib/locales/ja";
import { en } from "@/lib/locales/en";

// ──────────────────────────────────────────────────────────
// 型・定数
// ──────────────────────────────────────────────────────────
export type Language = "ja" | "en";

const LOCALES: Record<Language, Locale> = { ja, en };

/** localStorage のキー。AuthSessionContext の lp_sync_ts と衝突しないよう独自名 */
const LS_KEY = "samsian_lang";

type LanguageContextValue = {
  /** 現在選択中の言語 */
  language: Language;
  /** 言語を切り替える（localStorage にも保存） */
  setLanguage: (lang: Language) => void;
  /** 現在の言語に対応した辞書オブジェクト */
  t: Locale;
};

// ──────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue | null>(null);

// ──────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR では "ja" をデフォルトにし、hydration ミスマッチを避ける。
  // クライアント側の useEffect で localStorage から復元する。
  const [language, setLanguageState] = useState<Language>("ja");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === "ja" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // プライベートブラウジングなどで localStorage が使えない場合は無視
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {
      // 書き込み失敗は無視
    }
  }, []);

  const t = useMemo(() => LOCALES[language], [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage は LanguageProvider の内側で使用してください。");
  }
  return ctx;
}
