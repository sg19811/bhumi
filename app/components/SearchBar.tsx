"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/app/lib/i18n-client";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useLang();
  const [q, setQ] = useState("");
  function go(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : "/explore");
  }
  return (
    <form
      onSubmit={go}
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-gray-300 bg-white p-1.5 pl-5 shadow-md transition-shadow focus-within:border-green-600 focus-within:shadow-lg"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search.placeholder")}
        className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-gray-400"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 sm:px-7"
      >
        {t("search.button")}
      </button>
    </form>
  );
}
