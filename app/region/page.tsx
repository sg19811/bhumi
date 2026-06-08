import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { districtToState } from "@/app/lib/legal/districts";
import { stateLabel } from "@/app/lib/legal/options";
import type { Metadata } from "next";

export const revalidate = 600; // cache the region aggregation for 10 minutes

export const metadata: Metadata = {
  title: "Browse agricultural land by region — AcreHub",
  description:
    "Browse verified agricultural land, orchards, and farmhouse plots by district across India. Real boundaries on the map, trust scores, and legal clarity in every region.",
  alternates: { canonical: "/region" },
};

type DistrictTally = { name: string; count: number };

export default async function RegionsHub() {
  const { data: rows } = await supabase
    .from("listings")
    .select("district")
    .eq("status", "active");

  // Tally active listings per district (case-insensitive, trimmed).
  const byDistrict = new Map<string, DistrictTally>();
  for (const r of rows ?? []) {
    const raw = (r.district ?? "").trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    const existing = byDistrict.get(key);
    if (existing) existing.count += 1;
    else byDistrict.set(key, { name: raw, count: 1 });
  }

  // Group districts under their legal state; unmatched go under "Other regions".
  const OTHER = "__other__";
  const byState = new Map<string, DistrictTally[]>();
  for (const d of byDistrict.values()) {
    const state = districtToState(d.name) ?? OTHER;
    const list = byState.get(state) ?? [];
    list.push(d);
    byState.set(state, list);
  }

  // Order states by total listings (busiest first); "Other" always last.
  const stateSections = [...byState.entries()]
    .map(([state, districts]) => ({
      state,
      label: state === OTHER ? "Other regions" : stateLabel(state),
      districts: districts.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      total: districts.reduce((sum, d) => sum + d.count, 0),
    }))
    .sort((a, b) => {
      if (a.state === OTHER) return 1;
      if (b.state === OTHER) return -1;
      return b.total - a.total;
    });

  const totalListings = (rows ?? []).length;
  const totalDistricts = byDistrict.size;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Agricultural land by region — AcreHub",
    url: "https://acrehubindia.com/region",
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://acrehubindia.com/" },
      { "@type": "ListItem", position: 2, name: "Regions", item: "https://acrehubindia.com/region" },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
          <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-800">Home</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gray-400">Regions</span>
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Browse agricultural land by region</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            {totalDistricts > 0
              ? `${totalListings} ${totalListings === 1 ? "listing" : "listings"} across ${totalDistricts} ${totalDistricts === 1 ? "district" : "districts"} — verified land, real boundaries, and trust scores. Pick a district to explore.`
              : "Verified agricultural land with real boundaries, trust scores, and legal clarity. Districts appear here as land is listed."}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          {totalDistricts === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
              <p className="mb-4 text-gray-500">No active listings yet — be the first to put a region on the map.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/explore" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Browse all land</Link>
                <Link href="/listing/new" className="inline-block rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 transition-colors hover:bg-green-50">List your land</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {stateSections.map((section) => (
                <section key={section.state}>
                  <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-gray-100 pb-2">
                    <h2 className="text-xl font-semibold capitalize text-green-900">{section.label}</h2>
                    <span className="shrink-0 text-sm text-gray-400">
                      {section.total} {section.total === 1 ? "listing" : "listings"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {section.districts.map((d) => (
                      <Link
                        key={d.name}
                        href={`/region/${encodeURIComponent(d.name)}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
                      >
                        <span className="capitalize">{d.name}</span>
                        <span className="rounded-full bg-green-50 px-1.5 text-xs font-medium text-green-700">{d.count}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
