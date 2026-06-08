import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import CorridorGrid from "@/app/components/farm-plots/CorridorGrid";
import CitySelector from "@/app/components/farm-plots/CitySelector";
import ProjectsBrowser from "@/app/components/farm-plots/ProjectsBrowser";
import { CITIES, getCity } from "@/app/lib/farm-plots/cities";
import { getCorridor, getCorridorsByCity } from "@/app/lib/farm-plots/corridors";
import { cityCopy } from "@/app/lib/farm-plots/copy";
import { getCorridorCounts, getProjectListings } from "@/app/lib/farm-plots/queries";
import { formatINRShort } from "@/app/lib/format";

export const revalidate = 3600;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: "Farm plot projects | AcreHub" };
  return {
    title: `Farm plot projects in ${c.label} — managed & gated farmland | AcreHub`,
    description: `Managed and gated farm plot projects in ${c.label}, ${c.stateLabel}. Compare by corridor with real inventory, trust scores and legal clarity on AcreHub.`,
    alternates: { canonical: `/farm-plots/${c.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);

  // Back-compat / safety: an old flat corridor URL (/farm-plots/devanahalli) lands
  // here — redirect it to the nested path. Anything else is a 404.
  if (!c) {
    const corr = getCorridor(city);
    if (corr) redirect(`/farm-plots/${corr.parent_city}/${corr.slug}`);
    notFound();
  }

  const copy = cityCopy(c.slug, c.label);

  // Coming-soon city: honest placeholder, no fake content.
  if (c.status === "coming_soon") {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">
          <FarmPlotHero title={`Farm plots in ${c.label}`} subtitle={c.tagline} />
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6">
            <nav className="mb-6 flex items-center justify-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href="/farm-plots" className="hover:text-green-800">Farm plots</Link>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span className="text-gray-400">{c.label}</span>
            </nav>
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10">
              <p className="text-lg font-semibold text-gray-800">{c.label} is coming soon</p>
              <p className="mx-auto mt-2 max-w-md text-gray-600">
                We&apos;re live in Bangalore first and onboarding {c.label} ({c.stateLabel}) next. Tell us what you&apos;re
                looking for and we&apos;ll notify you as projects go live here.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/buy" className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Register your requirement →</Link>
                <Link href="/farm-plots/bangalore" className="rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 hover:bg-green-50">See Bangalore projects</Link>
              </div>
              <div className="mt-8 flex justify-center"><CitySelector current={c.slug} /></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Live city.
  const [counts, projects] = await Promise.all([
    getCorridorCounts(),
    getProjectListings({ city: c.slug, limit: 100 }),
  ]);

  const prices = projects.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0);
  const priceBand = prices.length
    ? `Observed prices range roughly ${formatINRShort(Math.min(...prices))}–${formatINRShort(Math.max(...prices))} across ${projects.length} live project${projects.length === 1 ? "" : "s"}.`
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Farm plots", item: "https://acrehubindia.com/farm-plots" },
      { "@type": "ListItem", position: 2, name: c.label, item: `https://acrehubindia.com/farm-plots/${c.slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="flex-1">
        <FarmPlotHero title={copy.heroTitle} subtitle={copy.heroSubtitle} />

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href="/farm-plots" className="hover:text-green-800">Farm plots</Link>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span className="text-gray-400">{c.label}</span>
            </nav>
            <CitySelector current={c.slug} />
          </div>

          <p className="mb-3 max-w-2xl whitespace-pre-line text-gray-600">{copy.intro}</p>
          {priceBand && <p className="mb-3 text-sm font-medium text-green-800">{priceBand}</p>}
          <p className="mb-10 max-w-2xl text-sm text-gray-500">{copy.priceNote}</p>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold">Corridors</h2>
            <CorridorGrid citySlug={c.slug} counts={counts} />
          </section>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold">Projects in {c.label}</h2>
            <ProjectsBrowser
              projects={projects}
              corridors={getCorridorsByCity(c.slug).map((cr) => ({ slug: cr.slug, label: cr.label }))}
            />
          </section>

          {copy.faqs.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold">Questions</h2>
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

          <p className="text-sm text-gray-600">
            Buying a farm plot in {c.label}? Check the{" "}
            <Link href={`/legal/state/${c.state}`} className="font-medium text-green-800 hover:underline">{c.stateLabel} land rules</Link>{" "}
            first, and consult a lawyer before you commit.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
