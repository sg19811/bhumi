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
          <Link href="/farm-plots" className="hover:text-green-800">{t("nav.farmPlots")}</Link>
          <Link href="/buy" className="hover:text-green-800">{t("footer.buy")}</Link>
          <Link href="/sell" className="hover:text-green-800">Sell land</Link>
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
      <div className="border-t border-gray-200/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-4 text-xs text-gray-500">
          <span className="font-semibold uppercase tracking-wide text-gray-400">Legal Navigator</span>
          <Link href="/legal/wizard" className="hover:text-green-800">Eligibility wizard</Link>
          <Link href="/legal/checklist" className="hover:text-green-800">Document checklist</Link>
          <Link href="/legal/due-diligence" className="hover:text-green-800">Due diligence</Link>
          <Link href="/legal/lawyers" className="hover:text-green-800">Land lawyers</Link>
          <Link href="/legal/services" className="hover:text-green-800">Services</Link>
          <Link href="/legal/articles" className="hover:text-green-800">Guides</Link>
        </div>
      </div>
    </footer>
  );
}
