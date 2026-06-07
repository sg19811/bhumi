import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import CorridorGrid from "@/app/components/farm-plots/CorridorGrid";
import { CITY_COPY } from "@/app/lib/farm-plots/copy";
import { getCorridorCounts, getProjectListings } from "@/app/lib/farm-plots/queries";
import { formatINRShort } from "@/app/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Farm plot projects in Bangalore — by corridor | AcreHub",
  description: "Managed and gated farm plot projects across Bangalore — Devanahalli, Kanakapura Road, Nandi Hills, Sarjapur–Anekal and more. Compare by corridor with real inventory.",
  alternates: { canonical: "/farm-plots/bangalore" },
};

export default async function BangaloreFarmPlots() {
  const [counts, projects] = await Promise.all([getCorridorCounts(), getProjectListings(undefined, 100)]);

  const prices = projects.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0);
  const priceBand = prices.length
    ? `Observed prices range roughly ${formatINRShort(Math.min(...prices))}–${formatINRShort(Math.max(...prices))} across ${projects.length} live project${projects.length === 1 ? "" : "s"}.`
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Farm plots", item: "https://bhumi.vercel.app/farm-plots" },
      { "@type": "ListItem", position: 2, name: "Bangalore", item: "https://bhumi.vercel.app/farm-plots/bangalore" },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="flex-1">
        <FarmPlotHero title={CITY_COPY.heroTitle} subtitle={CITY_COPY.heroSubtitle} />

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/farm-plots" className="hover:text-green-800">Farm plots</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gray-400">Bangalore</span>
          </nav>

          <p className="mb-3 max-w-2xl whitespace-pre-line text-gray-600">{CITY_COPY.intro}</p>
          {priceBand && <p className="mb-3 text-sm font-medium text-green-800">{priceBand}</p>}
          <p className="mb-10 max-w-2xl text-sm text-gray-500">{CITY_COPY.priceNote}</p>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold">Corridors</h2>
            <CorridorGrid counts={counts} />
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Questions</h2>
            <div className="space-y-3">
              {CITY_COPY.faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900">{f.q}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-sm text-gray-600">
            Buying a farm plot near Bangalore? Check the{" "}
            <Link href="/legal/state/karnataka" className="font-medium text-green-800 hover:underline">Karnataka land rules</Link>{" "}
            first (Hosur is in Tamil Nadu — see its corridor page for TN-specific notes).
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
