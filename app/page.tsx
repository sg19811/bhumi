import Link from "next/link";
import Header from "@/app/components/Header";
import SearchBar from "@/app/components/SearchBar";
import RecentlyViewed from "@/app/components/RecentlyViewed";
import WantedAreas from "@/app/components/WantedAreas";
import NotifyMe from "@/app/components/NotifyMe";
import ListingCard from "@/app/components/ListingCard";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { getLocale } from "@/app/lib/i18n-server";
import { t as translate } from "@/app/lib/i18n";

const budgets = [
  { key: "home.budget25", href: "/explore?max_price=2500000" },
  { key: "home.budget50", href: "/explore?max_price=5000000" },
  { key: "home.budget100", href: "/explore?max_price=10000000" },
];
const purposes = [
  { key: "home.p.orchard", href: "/land/orchard" },
  { key: "home.p.farmhouse", href: "/land/farmhouse_land" },
  { key: "home.p.irrigated", href: "/land/irrigated_farmland" },
  { key: "home.p.na", href: "/land/na_converted" },
];

const needs = [
  { key: "home.need.verified", subKey: "home.need.verifiedSub", href: "/explore?verified=true", icon: <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /> },
  { key: "home.need.water", subKey: "home.need.waterSub", href: "/explore?water_source=borewell", icon: <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" /> },
  { key: "home.need.highway", subKey: "home.need.highwaySub", href: "/explore?road_access=highway", icon: <path d="M12 3v18M8 3v4m8-4v4M7 21l1.5-9m8.5 9-1.5-9" /> },
  { key: "home.need.orchards", subKey: "home.need.orchardsSub", href: "/explore?land_type=orchard", icon: <path d="M12 21v-6m0 0a6 6 0 1 0-4.2-10.3A5 5 0 0 0 5 13a4 4 0 0 0 4 2h6a4 4 0 0 0 3-6.7" /> },
  { key: "home.need.budget", subKey: "home.need.budgetSub", href: "/explore?max_price=2500000&sort=price_asc", icon: <path d="M9 8h6M9 12h6m-6 0c3 0 4 4 0 4m0-8c4 0 4 4 0 4m9 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> },
  { key: "home.need.largest", subKey: "home.need.largestSub", href: "/explore?sort=area_desc", icon: <path d="M15 3h6v6m0-6-7 7M9 21H3v-6m0 6 7-7" /> },
  { key: "home.need.legal", subKey: "home.need.legalSub", href: "/legal", icon: <path d="M12 3v3m0 0 7 3-7 3-7-3 7-3ZM5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M3 20h18" /> },
];

const trust = [
  { key: "home.pillar.verified", bodyKey: "home.pillar.verifiedBody", icon: <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /> },
  { key: "home.pillar.legal", bodyKey: "home.pillar.legalBody", icon: <path d="M12 3v3m0 0 7 3-7 3-7-3 7-3ZM5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M3 20h18" /> },
  { key: "home.pillar.boundaries", bodyKey: "home.pillar.boundariesBody", icon: <path d="M9 20l-5 2V6l5-2m0 16 6-2m-6 2V4m6 14 5 2V6l-5-2m0 16V4m0 0L9 6" /> },
];

export default async function Home() {
  const locale = await getLocale();
  const t = (k: string) => translate(locale, k);
  const { count } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  // buyer_interests has no public-read RLS policy (admins/owners only), so the anon
  // browser client always counts 0. Use the server admin client for this aggregate.
  const { count: buyerCount } = await supabaseAdmin.from("buyer_interests").select("*", { count: "exact", head: true }).eq("status", "active");
  const { data: latest } = await supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(4);
  const { data: distRows } = await supabase.from("listings").select("district").eq("status", "active");
  const regions = (() => {
    const m = new Map<string, number>();
    for (const r of distRows ?? []) {
      const d = (r.district ?? "").trim();
      if (d) m.set(d, (m.get(d) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  })();

  const siteLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AcreHub",
      url: "https://acrehubindia.com",
      description: "Trusted agricultural land marketplace — verified listings, legal clarity, and real maps.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "AcreHub",
      url: "https://acrehubindia.com",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://acrehubindia.com/explore?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-green-50 via-green-50/40 to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-green-900) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <main className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-green-800">
            {t("home.badge")}
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            {t("home.titlePre")}{" "}
            <span className="text-green-800">{t("home.titleHighlight")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-gray-600">
            {t("home.subtitle")}
          </p>

          <div className="mt-8">
            <SearchBar />
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {budgets.map((b) => (
              <Link key={b.href} href={b.href} className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
                {t(b.key)}
              </Link>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap justify-center gap-2">
            {purposes.map((p) => (
              <Link key={p.href} href={p.href} className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
                {t(p.key)}
              </Link>
            ))}
          </div>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sell" className="rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-800">
              {t("home.listFree")}
            </Link>
            <Link href="/buy" className="rounded-full border border-green-700 px-6 py-3 text-sm font-medium text-green-800 transition-colors hover:bg-green-50">
              {t("home.postBuy")}
            </Link>
          </div>

          {(count || buyerCount) ? (
            <p className="mt-8 text-sm text-gray-500">
              <span className="font-semibold text-green-800">{count ?? 0}</span> {t("home.statListings")} ·{" "}
              <span className="font-semibold text-green-800">{buyerCount ?? 0}</span> {t("home.statBuyers")}
            </p>
          ) : <div className="mt-8" />}
        </main>
      </section>

      {/* Browse by need */}
      <section className="mx-auto max-w-5xl px-6 pt-16 sm:pt-20">
        <h2 className="mb-1 text-center text-2xl font-semibold sm:text-3xl">{t("home.needsTitle")}</h2>
        <p className="mb-8 text-center text-gray-500">{t("home.needsSub")}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {needs.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {n.icon}
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight text-gray-900 group-hover:text-green-800">{t(n.key)}</span>
                <span className="block text-sm text-gray-500">{t(n.subKey)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Demand nudge for sellers (renders only when there's a clear signal) */}
      <div className="mx-auto max-w-5xl px-6 pt-12 empty:hidden sm:pt-16">
        <WantedAreas />
      </div>

      {/* Just listed */}
      {latest && latest.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pt-16 sm:pt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{t("home.justListed")}</h2>
              <p className="mt-0.5 text-gray-500">{t("home.justListedSub")}</p>
            </div>
            <Link href="/explore" className="shrink-0 text-sm font-medium text-green-800 hover:underline">{t("common.viewAll")}</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by region */}
      {regions.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pt-16 sm:pt-20">
          <h2 className="mb-1 text-2xl font-semibold sm:text-3xl">{t("home.regionsTitle")}</h2>
          <p className="mb-6 text-gray-500">{t("home.regionsSub")}</p>
          <div className="flex flex-wrap items-center gap-2.5">
            {regions.map((r) => (
              <Link
                key={r.name}
                href={`/region/${encodeURIComponent(r.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
              >
                <span className="capitalize">{r.name}</span>
                <span className="text-gray-400">{r.count}</span>
              </Link>
            ))}
            <Link
              href="/region"
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-green-800 transition-colors hover:text-green-900 hover:underline"
            >
              Browse all regions →
            </Link>
          </div>
        </section>
      )}

      {/* Trust pillars */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {trust.map((p) => (
            <div key={p.key} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {p.icon}
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-green-800">{t(p.key)}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{t(p.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Get notified about new land */}
      <section className="mx-auto max-w-3xl px-6 pb-4 pt-4">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold text-green-900 sm:text-2xl">Be first to know about new land</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-green-800">Get an alert when verified land that fits is listed. No spam — leave anytime.</p>
          <NotifyMe />
        </div>
      </section>

      <RecentlyViewed />

      {/* Agent recruitment */}
      <section className="mx-auto max-w-3xl px-6 pb-4 pt-4">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:flex-row sm:p-8 sm:text-left">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Are you a land agent?</h2>
            <p className="mt-1 text-sm text-gray-600">Join the Acrehub Agent Network and send properties over WhatsApp — we turn them into listings, and every enquiry routes back to you.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/agents/how-it-works" className="rounded-full border border-green-700 px-5 py-2.5 text-sm font-medium text-green-800 hover:bg-green-50">How it works</Link>
            <Link href="/agents/join" className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800">Apply to join</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
