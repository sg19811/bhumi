import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import { CORRIDORS, getCorridor } from "@/app/lib/farm-plots/corridors";
import { corridorCopy } from "@/app/lib/farm-plots/copy";
import { getProjectListings } from "@/app/lib/farm-plots/queries";

export const revalidate = 3600;

export function generateStaticParams() {
  return CORRIDORS.map((c) => ({ corridor: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ corridor: string }> }): Promise<Metadata> {
  const { corridor } = await params;
  const c = getCorridor(corridor);
  if (!c) return { title: "Farm plot projects | AcreHub" };
  return {
    title: `Farm plot projects in ${c.label} — near Bangalore | AcreHub`,
    description: `Managed and gated farm plot projects in ${c.label}. Plot sizes, prices, amenities, and the legal checks that matter — with real inventory on AcreHub.`,
    alternates: { canonical: `/farm-plots/${c.slug}` },
  };
}

export default async function CorridorPage({ params }: { params: Promise<{ corridor: string }> }) {
  const { corridor } = await params;
  const c = getCorridor(corridor);
  if (!c) notFound();

  const copy = corridorCopy(c.slug);
  const projects = await getProjectListings(c.slug, 24);
  const stateLabel = c.state === "tamil_nadu" ? "Tamil Nadu" : "Karnataka";

  const distances = projects.map((p) => Number(p.distance_from_city_km)).filter((n) => Number.isFinite(n) && n > 0);
  const avgDistance = distances.length ? Math.round(distances.reduce((a, b) => a + b, 0) / distances.length) : null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Farm plots", item: "https://bhumi.vercel.app/farm-plots" },
      { "@type": "ListItem", position: 2, name: "Bangalore", item: "https://bhumi.vercel.app/farm-plots/bangalore" },
      { "@type": "ListItem", position: 3, name: c.label, item: `https://bhumi.vercel.app/farm-plots/${c.slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="flex-1">
        <FarmPlotHero title={`Farm plots in ${c.label}`} subtitle={copy.positioning} />

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/farm-plots" className="hover:text-green-800">Farm plots</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <Link href="/farm-plots/bangalore" className="hover:text-green-800">Bangalore</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gray-400">{c.label}</span>
          </nav>

          {c.state === "tamil_nadu" && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <span className="font-semibold">Note:</span> {c.label} is in Tamil Nadu — land law differs from Karnataka, and AcreHub&apos;s Tamil Nadu legal guidance is still under review. Treat any legal note here as informational and consult a verified lawyer.
            </div>
          )}

          <p className="mb-3 max-w-2xl whitespace-pre-line text-gray-600">{copy.knownFor}</p>
          <p className="mb-8 max-w-2xl whitespace-pre-line text-gray-600">{copy.landUse}</p>

          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800">{projects.length}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">projects</p></div>
            <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800">{avgDistance ? `${avgDistance} km` : "—"}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">avg from city</p></div>
            <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold text-green-800">{stateLabel}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">state</p></div>
            <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800">{c.parent_city}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">near</p></div>
          </div>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold">Projects in {c.label}</h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((l) => <ListingCard key={String(l.id)} listing={l} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
                No projects listed in {c.label} yet.{" "}
                <Link href="/buy" className="font-medium text-green-800 hover:underline">Post what you&apos;re looking for →</Link>
              </div>
            )}
          </section>

          <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Legal check ({stateLabel})</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-600">{copy.legalNote}</p>
            <Link href={`/legal/state/${c.state}`} className="mt-3 inline-block rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">
              {stateLabel} land guide →
            </Link>
          </div>

          {copy.faqs.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold">FAQs — {c.label}</h2>
              <div className="space-y-3">
                {copy.faqs.map((f) => (
                  <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">{f.q}</h3>
                    <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/farm-plots/bangalore" className="font-medium text-green-800 hover:underline">← All Bangalore corridors</Link>
            <Link href="/explore?land_type=farm_plot_project" className="font-medium text-green-800 hover:underline">Browse all farm plot projects →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
