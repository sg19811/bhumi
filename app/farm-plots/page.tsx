import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import CorridorGrid from "@/app/components/farm-plots/CorridorGrid";
import { HUB_COPY } from "@/app/lib/farm-plots/copy";
import { getCorridorCounts, getProjectListings } from "@/app/lib/farm-plots/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Farm plot projects near Bangalore — managed & gated farmland | AcreHub",
  description: "Compare managed, gated and plantation farm plot projects across Bangalore's corridors — real boundaries, plot inventory, trust scores, and legal clarity. Not hype.",
  alternates: { canonical: "/farm-plots" },
};

export default async function FarmPlotsHub() {
  const [counts, samples] = await Promise.all([getCorridorCounts(), getProjectListings(undefined, 3)]);

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
          <p className="mb-10 max-w-2xl whitespace-pre-line text-gray-600">{HUB_COPY.intro}</p>

          <section className="mb-12">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-bold">Browse by corridor</h2>
              <Link href="/farm-plots/bangalore" className="shrink-0 text-sm font-medium text-green-800 hover:underline">All Bangalore →</Link>
            </div>
            <CorridorGrid counts={counts} />
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
