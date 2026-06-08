import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import CityGrid from "@/app/components/farm-plots/CityGrid";
import CitySelector from "@/app/components/farm-plots/CitySelector";
import CorridorGrid from "@/app/components/farm-plots/CorridorGrid";
import { HUB_COPY } from "@/app/lib/farm-plots/copy";
import { getCorridorCounts, getCityCounts, getProjectListings } from "@/app/lib/farm-plots/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Farm plot projects across India — managed & gated farmland | AcreHub",
  description: "Compare managed, gated and plantation farm plot projects across India — real boundaries, plot inventory, trust scores, and legal clarity. Live in Bangalore, expanding city by city.",
  alternates: { canonical: "/farm-plots" },
};

export default async function FarmPlotsHub() {
  const [cityCounts, corridorCounts, samples] = await Promise.all([
    getCityCounts(),
    getCorridorCounts(),
    getProjectListings({ limit: 3 }),
  ]);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HUB_COPY.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <FarmPlotHero title={HUB_COPY.heroTitle} subtitle={HUB_COPY.heroSubtitle} />

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl whitespace-pre-line text-gray-600">{HUB_COPY.intro}</p>
            <div className="shrink-0"><CitySelector /></div>
          </div>

          {/* PAN-India: choose a city */}
          <section className="mb-14">
            <h2 className="mb-5 text-2xl font-bold">Choose your city</h2>
            <CityGrid counts={cityCounts} />
          </section>

          {/* Featured market: Bangalore (our focus city) */}
          <section className="mb-14">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-green-700">Featured city</span>
                <h2 className="text-2xl font-bold">Bangalore — browse by corridor</h2>
              </div>
              <Link href="/farm-plots/bangalore" className="shrink-0 text-sm font-medium text-green-800 hover:underline">All Bangalore →</Link>
            </div>
            <CorridorGrid citySlug="bangalore" counts={corridorCounts} />
          </section>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold">Sample projects</h2>
            {samples.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {samples.map((l) => <ListingCard key={String(l.id)} listing={l} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
                Projects are being onboarded. <Link href="/buy" className="font-medium text-green-800 hover:underline">Post what you&apos;re looking for →</Link>
              </div>
            )}
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Questions buyers ask</h2>
            <div className="space-y-3">
              {HUB_COPY.faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900">{f.q}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-700">Developer or landowner? List your project and manage your leads.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/listing/new" className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">List a project</Link>
              <Link href="/farm-plots/dashboard" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Developer dashboard</Link>
              <Link href="/farm-plots/resale" className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Resale marketplace</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="font-semibold text-green-900">Before you buy a farm plot, check the legal basics.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/legal/checklist" className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Document checklist</Link>
              <Link href="/legal" className="rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 hover:bg-green-50">Legal navigator</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
