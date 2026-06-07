"use client";

import { createContext, useContext, ReactNode } from "react";
import { t as translate, type Locale } from "./i18n";

const LocaleContext = createContext<Locale>("en");

// Seeded with the server-read locale so SSR and client render match (no flash).
export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLang() {
  const locale = useContext(LocaleContext);
  return { locale, t: (key: string) => translate(locale, key) };
}
