"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { formatINR, formatINRShort } from "@/app/lib/format";
import { LAND_TYPE_LABELS } from "@/app/lib/land";
import { projectRisk } from "@/app/lib/farm-plots/risk";
import { projectTransparency } from "@/app/lib/farm-plots/transparency";
import { getTier } from "@/app/lib/farm-plots/verification";
import { corridorLabel } from "@/app/lib/farm-plots/corridors";
import { cityLabel } from "@/app/lib/farm-plots/cities";
import AiBuyerSummary from "@/app/components/farm-plots/AiBuyerSummary";

const humanize = (s?: string | null) => (s ? String(s).replace(/_/g, " ") : "—");

// A clean, printable one-page buyer report compiled from the project's data.
// Browser print → "Save as PDF". Not AI-generated; just an honest summary.
export default function BuyerReport() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [listing, setListing] = useState<any>(null);
  const [plots, setPlots] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      setListing(data ?? null);
      if (data) {
        const [{ data: pl }, { data: dc }] = await Promise.all([
          supabase.from("farm_project_plots").select("*").eq("listing_id", id),
          supabase.from("project_documents").select("*").eq("listing_id", id),
        ]);
        setPlots(pl ?? []);
        setDocs(dc ?? []);
      }
      setLoaded(true);
    })();
  }, [id]);

  if (!loaded) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading report…</div>;
  if (!listing) return <div className="flex min-h-screen items-center justify-center text-gray-400">Project not found.</div>;

  const risk = projectRisk(listing);
  const items = projectTransparency(listing);
  const tier = getTier(listing.verification_tier);
  const place = [corridorLabel(listing.corridor), cityLabel(listing.nearest_city)].filter(Boolean).join(", ");
  const available = plots.filter((p) => p.status === "available").length;

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="text-right font-medium text-gray-800">{v}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl bg-white px-6 py-8 text-gray-900 print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/listing/${id}`} className="text-sm text-green-800 hover:underline">← Back to listing</Link>
        <button onClick={() => window.print()} className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800">🖨 Print / Save as PDF</button>
      </div>

      <header className="border-b-2 border-green-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">AcreHub · Farm plot buyer report</p>
        <h1 className="mt-1 text-2xl font-bold">{listing.project_name || listing.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{place || listing.district || ""}{tier.value !== "unverified" ? ` · ${tier.label}` : ""}</p>
        <p className="mt-2 text-xl font-bold text-green-800">{formatINRShort(listing.price)} <span className="text-sm font-normal text-gray-500" title={formatINR(listing.price)}>({formatINR(listing.price)})</span></p>
      </header>

      <div className="mt-5"><AiBuyerSummary listingId={String(id)} /></div>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Project summary</h2>
        <Row k="Land type" v={LAND_TYPE_LABELS[listing.land_type] ?? humanize(listing.land_type)} />
        <Row k="Developer" v={listing.developer_name || "—"} />
        <Row k="Stage" v={humanize(listing.project_stage)} />
        <Row k="Total area" v={listing.total_project_acres ? `${listing.total_project_acres} acres` : "—"} />
        <Row k="Plots" v={listing.plot_count ? `${listing.plot_count}${plots.length ? ` (${available} available now)` : ""}` : "—"} />
        <Row k="Plot sizes" v={listing.plot_size_min_value ? `${listing.plot_size_min_value}–${listing.plot_size_max_value ?? listing.plot_size_min_value} ${listing.plot_size_unit ?? ""}` : "—"} />
        <Row k="Possession" v={humanize(listing.possession_timeline)} />
        <Row k="From city" v={listing.distance_from_city_km ? `${listing.distance_from_city_km} km` : "—"} />
        <Row k="Maintenance" v={listing.maintenance_fee_amount ? `${formatINRShort(listing.maintenance_fee_amount)} / ${humanize(listing.maintenance_fee_period)}` : "—"} />
        <Row k="Layout approval" v={humanize(listing.layout_approval_status)} />
        <Row k="Land conversion" v={humanize(listing.conversion_status)} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Risk read: {risk.level}</h2>
        {risk.flags.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {risk.flags.map((f) => <li key={f.label}><span className="font-medium">{f.label}.</span> {f.note}</li>)}
          </ul>
        ) : <p className="text-sm text-gray-600">No major risk flags from disclosed details. Still verify documents and visit the site.</p>}
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Disclosure checklist</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-2 text-sm">
              <span>{it.status === "good" ? "✓" : it.status === "caution" ? "⚠" : "–"}</span>
              <span className="text-gray-700">{it.label}</span>
            </div>
          ))}
        </div>
      </section>

      {docs.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Documents shared</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700">{docs.map((d) => <li key={d.id}>{d.label}</li>)}</ul>
        </section>
      )}

      <footer className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
        Generated by AcreHub from developer-disclosed details. This is not legal or financial advice and not a
        verification of title. Independently verify ownership, revenue records, conversion and approvals, and consult a
        lawyer before any payment.
      </footer>
    </div>
  );
}
