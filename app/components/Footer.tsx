"use client";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import { useLang } from "@/app/lib/i18n-client";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Logo className="text-xl" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
          <Link href="/explore" className="hover:text-green-800">{t("nav.explore")}</Link>
          <Link href="/buy" className="hover:text-green-800">{t("footer.buy")}</Link>
          <Link href="/how-it-works" className="hover:text-green-800">{t("footer.howItWorks")}</Link>
          <Link href="/tools" className="hover:text-green-800">{t("footer.tools")}</Link>
          <Link href="/legal" className="hover:text-green-800">{t("nav.legal")}</Link>
          <Link href="/faq" className="hover:text-green-800">{t("footer.faq")}</Link>
          <Link href="/about" className="hover:text-green-800">{t("footer.about")}</Link>
          <Link href="/privacy" className="hover:text-green-800">{t("footer.privacy")}</Link>
          <Link href="/terms" className="hover:text-green-800">{t("footer.terms")}</Link>
        </nav>
        <p className="text-xs text-gray-400">{t("footer.tagline")}</p>
      </div>
    </footer>
  );
}
