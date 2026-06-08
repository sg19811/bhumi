import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import VerificationBadge from "@/app/components/farm-plots/VerificationBadge";
import { getDeveloperNames, resolveDeveloperSlug, slugifyDeveloper } from "@/app/lib/farm-plots/developers";
import { getProjectsByDeveloper } from "@/app/lib/farm-plots/queries";
import { cityLabel } from "@/app/lib/farm-plots/cities";
import { corridorLabel } from "@/app/lib/farm-plots/corridors";
import { VERIFICATION_TIERS, getTier } from "@/app/lib/farm-plots/verification";

export const revalidate = 3600;

export async function generateStaticParams() {
  const names = await getDeveloperNames();
  return names.map((n) => ({ slug: slugifyDeveloper(n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = await resolveDeveloperSlug(slug);
  if (!name) return { title: "Developer | AcreHub" };
  return {
    title: `${name} — farm plot projects | AcreHub`,
    description: `All active farm-plot projects by ${name} on AcreHub, with locations, plot details and transparency.`,
    alternates: { canonical: `/farm-plots/developer/${slug}` },
  };
}

export default async function DeveloperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = await resolveDeveloperSlug(slug);
  if (!name) notFound();

  const projects = await getProjectsByDeveloper(name, undefined, 50);

  // Aggregate footprint.
  const cities = [...new Set(projects.map((p) => p.nearest_city).filter(Boolean) as string[])];
  const corridors = [...new Set(projects.map((p) => p.corridor).filter(Boolean) as string[])];
  // Highest verification tier across their projects.
  const tierRank = (v?: string | null) => VERIFICATION_TIERS.findIndex((t) => t.value === getTier(v).value);
  const topTier = projects.reduce<string>((best, p) => {
    const t = String(p.verification_tier ?? "unverified");
    return tierRank(t) > tierRank(best) ? t : best;
  }, "unverified");

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Farm plots", item: "https://acrehubindia.com/farm-plots" },
      { "@type": "ListItem", position: 2, name, item: `https://acrehubindia.com/farm-plots/developer/${slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="flex-1">
        <FarmPlotHero title={name} subtitle={`${projects.length} active farm-plot project${projects.length === 1 ? "" : "s"} on AcreHub`} />

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/farm-plots" className="hover:text-green-800">Farm plots</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gray-400">{name}</span>
          </nav>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <VerificationBadge tier={topTier} />
            {cities.length > 0 && (
              <span className="text-sm text-gray-500">
                Operating in {cities.map((c) => cityLabel(c)).join(", ")}
                {corridors.length > 0 ? ` · ${corridors.map((c) => corridorLabel(c)).join(", ")}` : ""}
              </span>
            )}
          </div>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold">Projects</h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((l) => <ListingCard key={String(l.id)} listing={l} />)}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">No active projects right now.</p>
            )}
          </section>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900">
            AcreHub doesn&apos;t endorse developers. Verify {name}&apos;s registration, track record, approvals and documents
            independently before any payment. <Link href="/legal/checklist" className="font-medium underline">Document checklist →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
