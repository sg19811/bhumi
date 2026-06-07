"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/app/lib/i18n-client";
import { locales, localeNames } from "@/app/lib/i18n";

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLang();

  function set(l: string) {
    document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh(); // re-render server components in the new language
  }

  return (
    <select
      value={locale}
      onChange={(e) => set(e.target.value)}
      aria-label="Language"
      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none hover:border-green-600"
    >
      {locales.map((l) => (
        <option key={l} value={l}>{localeNames[l]}</option>
      ))}
    </select>
  );
}
