"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import { useLang } from "@/app/lib/i18n-client";
import Logo from "@/app/components/Logo";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, role, userType, signOut } = useAuth();
  // Agent dashboard is open to the agent/admin roles and anyone who picked "Agent".
  const isAgent = role === "agent" || role === "admin" || userType === "agent";
  const { t } = useLang();
  const pathname = usePathname();
  const links = [
    { href: "/explore", key: "nav.explore" },
    { href: "/farm-plots", key: "nav.farmPlots" },
    { href: "/sell", key: "nav.sell" },
    { href: "/buy", key: "nav.buy" },
    { href: "/requirements", key: "nav.requirements" },
    { href: "/legal", key: "nav.legal" },
  ];
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Logo />
        <button
          className="-mr-1 flex h-10 w-10 items-center justify-center rounded-lg text-xl text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 transition-colors ${
                isActive(l.href)
                  ? "font-medium text-green-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-green-800"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-gray-200" />
          {user ? (
            <>
              <Link href="/my-listings" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.myListings")}</Link>
              <Link href="/my-requirements" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.myRequirements")}</Link>
              <Link href="/saved" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.saved")}</Link>
              <Link href="/collections" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.collections")}</Link>
              <Link href="/co-buy/circles" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">Circles</Link>
              {isAgent && (
                <Link href="/agent" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.agent")}</Link>
              )}
              {role === "admin" && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.dashboard")}</Link>
              )}
              <button onClick={signOut} className="rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:text-red-600">{t("nav.signout")}</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800">{t("nav.signin")}</Link>
              <Link href="/auth/signup" className="rounded-full bg-green-700 px-5 py-2 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Sign up</Link>
            </>
          )}
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <LanguageSwitcher />
        </nav>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 px-4 py-3 text-sm md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 ${
                isActive(l.href)
                  ? "bg-green-50 font-medium text-green-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
          <span className="my-1 h-px w-full bg-gray-200" />
          {user ? (
            <>
              <Link href="/my-listings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">{t("nav.myListings")}</Link>
              <Link href="/my-requirements" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">{t("nav.myRequirements")}</Link>
              <Link href="/saved" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">{t("nav.saved")}</Link>
              <Link href="/collections" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">{t("nav.collections")}</Link>
              <Link href="/co-buy/circles" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">Circles</Link>
              {isAgent && (
                <Link href="/agent" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">{t("nav.agent")}</Link>
              )}
              {role === "admin" && (
                <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">{t("nav.dashboard")}</Link>
              )}
              <button onClick={() => { signOut(); setOpen(false); }} className="rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50">{t("nav.signout")}</button>
            </>
          ) : (
            <>
              <Link href="/auth/signup" onClick={() => setOpen(false)} className="mt-1 rounded-full bg-green-700 px-3 py-2.5 text-center font-medium text-white">Sign up</Link>
              <Link href="/auth/signin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-center text-gray-700 hover:bg-gray-100">{t("nav.signin")}</Link>
            </>
          )}
          <div className="mt-2 px-3"><LanguageSwitcher /></div>
        </nav>
      )}
    </header>
  );
}
