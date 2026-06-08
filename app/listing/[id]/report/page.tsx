import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import PrintButton from "@/app/components/PrintButton";
import { computeLandHealth } from "@/app/lib/land-health";
import { buildBuyerDecision } from "@/app/lib/buyer-decision";
import { computeTrust } from "@/app/lib/trust";
import { buildPriceInsight } from "@/app/lib/price-insight";
import { districtToState } from "@/app/lib/legal/districts";
import { stateLabel } from "@/app/lib/legal/options";
import { landLabel } from "@/app/lib/land";
import { formatINR, formatINRShort, pricePerAcre } from "@/app/lib/format";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: l } = await supabase.from("listings").select("title").eq("id", id).single();
  return {
    title: l ? `Buyer report — ${l.title} · AcreHub` : "Buyer report — AcreHub",
    robots: { index: false }, // per-listing report; not a page to index
    alternates: { canonical: `/listing/${id}/report` },
  };
}

const humanize = (s?: string | null) => (s ? String(s).replace(/_/g, " ") : "—");

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="text-right font-medium text-gray-800">{v}</span>
    </div>
  );
}

export default async function ListingReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();

  if (!listing) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Listing not found.</div>;
  }

  // Comparables for price position (mirrors the listing detail page).
  const cmpCols = "price, price_basis, area_value, area_unit, district, land_type";
  const [{ data: byType }, { data: byDistrict }] = await Promise.all([
    listing.land_type
      ? supabase.from("listings").select(cmpCols).eq("status", "active").eq("land_type", listing.land_type).neq("id", listing.id).limit(300)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    listing.district
      ? supabase.from("listings").select(cmpCols).eq("status", "active").ilike("district", listing.district).neq("id", listing.id).limit(300)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);
  const cmpMap = new Map<string, Record<string, unknown>>();
  for (const r of [...(byType ?? []), ...(byDistrict ?? [])]) {
    cmpMap.set(`${r.district}|${r.land_type}|${r.price}|${r.area_value}|${r.area_unit}|${r.price_basis}`, r);
  }
  const priceInsight = buildPriceInsight(listing, [...cmpMap.values()], landLabel);

  const health = computeLandHealth(listing);
  const decision = buildBuyerDecision(listing, priceInsight);
  const trust = computeTrust(listing);
  const ppa = pricePerAcre(listing);
  const place = [listing.village, listing.taluka, listing.district].filter(Boolean).join(", ");
  const state = districtToState(listing.district);

  return (
    <div className="mx-auto max-w-3xl bg-white px-6 py-8 text-gray-900 print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/listing/${id}`} className="text-sm text-green-800 hover:underline">← Back to listing</Link>
        <PrintButton />
      </div>

      <header className="border-b-2 border-green-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">AcreHub · Buyer report</p>
        <h1 className="mt-1 text-2xl font-bold">{listing.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{place || "—"}</p>
        <p className="mt-2 text-xl font-bold text-green-800">
          {formatINR(listing.price)}
          <span className="ml-1 text-sm font-normal text-gray-500">
            {listing.price_basis === "per_acre" ? "/ acre" : listing.price_basis === "per_guntha" ? "/ guntha" : listing.price_basis === "per_sqft" ? "/ sq ft" : "total"}
            {ppa && listing.price_basis !== "per_acre" ? ` · ≈ ${formatINRShort(ppa)}/acre` : ""}
          </span>
        </p>
      </header>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Key facts</h2>
        <Row k="Land type" v={listing.land_type ? landLabel(listing.land_type) : "—"} />
        <Row k="Area" v={listing.area_value ? `${listing.area_value} ${listing.area_unit ?? ""}` : "—"} />
        <Row k="Water source" v={humanize(listing.water_source)} />
        <Row k="Road access" v={humanize(listing.road_access)} />
        <Row k="Electricity" v={listing.electricity ? "Yes" : "—"} />
        <Row k="Fenced" v={listing.fencing ? "Yes" : "—"} />
        <Row k="Verified by AcreHub" v={listing.is_verified ? "Yes" : "No"} />
        {listing.created_at && <Row k="Listed" v={new Date(listing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />}
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Land Health Score: {health.score}/100</h2>
        <div className="space-y-1.5">
          {health.dimensions.map((d) => (
            <div key={d.key} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 text-gray-600">{d.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <span className={`block h-full rounded-full ${d.score >= 75 ? "bg-green-600" : d.score >= 50 ? "bg-amber-500" : "bg-gray-400"}`} style={{ width: `${d.score}%` }} />
              </span>
              <span className="w-7 shrink-0 text-right text-gray-400">{d.score}</span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Indicative, from the listed features — not a survey.</p>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-green-800">Strengths</h2>
          {decision.strengths.length ? (
            <ul className="space-y-1 text-sm text-gray-700">{decision.strengths.map((s) => <li key={s}>✓ {s}</li>)}</ul>
          ) : <p className="text-sm text-gray-400">No standout strengths listed yet.</p>}
        </div>
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">Check before buying</h2>
          <ul className="space-y-1 text-sm text-gray-700">{decision.risks.map((r) => <li key={r}>! {r}</li>)}</ul>
        </div>
      </section>

      {decision.bestFor.length > 0 && (
        <p className="mt-4 text-sm"><span className="font-semibold text-gray-700">Best suited for:</span> {decision.bestFor.join(" · ")}</p>
      )}

      {priceInsight && (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Price position</h2>
          <p className="text-sm text-gray-700">
            At ≈ {formatINRShort(priceInsight.thisPpa)}/acre, this is{" "}
            <strong>{Math.abs(Math.round(priceInsight.deltaPct))}% {priceInsight.deltaPct <= 0 ? "below" : "above"}</strong>{" "}
            the median of {formatINRShort(priceInsight.median)}/acre for {priceInsight.scopeLabel} ({priceInsight.sampleSize} compared).
          </p>
        </section>
      )}

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Trust signals ({trust.score}/100 · {trust.tier})</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {trust.signals.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span>{s.met ? "✓" : "–"}</span>
              <span className={s.met ? "text-gray-700" : "text-gray-400"}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 print:hidden">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Before you pay — legal checklist</h2>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          <Link href={`/legal/wizard?${listing.land_type ? `land_type=${listing.land_type}&` : ""}${state ? `state=${state}&` : ""}listing=${id}`} className="font-medium text-green-800 hover:underline">⚖️ Who can buy this land →</Link>
          <Link href="/legal/checklist" className="font-medium text-green-800 hover:underline">📋 Document checklist →</Link>
          <Link href={`/legal/due-diligence?listing=${id}`} className="font-medium text-green-800 hover:underline">✅ Due diligence →</Link>
          {state && <Link href={`/legal/state/${state}`} className="font-medium text-green-800 hover:underline">📖 {stateLabel(state)} rules →</Link>}
        </div>
      </section>

      <footer className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
        Generated by AcreHub from the listed details. This is an indicative summary — not legal or financial advice,
        and not a verification of title. Independently verify ownership, survey/revenue records, and approvals, and
        consult a lawyer before any payment.
      </footer>
    </div>
  );
}
