"use client";

import { createContext, useContext, ReactNode } from "react";
import { type Audience, getAudienceFromEnv } from "@/lib/audience";

const AudienceContext = createContext<Audience | null>(null);

export function AudienceProvider({
  audience,
  children,
}: {
  audience: Audience;
  children: ReactNode;
}) {
  return (
    <AudienceContext.Provider value={audience}>
      {children}
    </AudienceContext.Provider>
  );
}

/**
 * クライアントコンポーネントでオーディエンスを取得。
 * AudienceProvider 配下で呼ぶのが前提だが、万が一 Provider 外の場合は
 * ビルド時環境変数にフォールバックする。
 */
export function useAudience(): Audience {
  const value = useContext(AudienceContext);
  return value ?? getAudienceFromEnv();
}
