// Buyer Decision Dashboard — an honest, automated read of a listing's strengths,
// things to check, and what it's best suited for. Pure and server-safe. This is
// NOT advice: every point is derived transparently from the listed details and
// the same signals shown elsewhere on the page (trust score, suitability,
// price insight). When in doubt it flags a check rather than reassures.

import { computeSuitability } from "@/app/lib/suitability";
import type { PriceInsight } from "@/app/lib/price-insight";

export type BuyerDecision = {
  strengths: string[];
  risks: string[]; // "check before buying"
  bestFor: string[]; // purposes this land suits
};

type DecisionListing = {
  water_source?: string | null;
  road_access?: string | null;
  land_type?: string | null;
  electricity?: boolean | null;
  fencing?: boolean | null;
  is_verified?: boolean | null;
  photos?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
};

const ASSURED_WATER = ["borewell", "canal", "river"];
const GOOD_ROAD = ["highway", "paved"];
const CONVERTED = ["na_converted", "developed_rural_plot"];

export function buildBuyerDecision(
  listing: DecisionListing,
  priceInsight?: PriceInsight | null
): BuyerDecision {
  const water = (listing.water_source ?? "").toLowerCase();
  const road = (listing.road_access ?? "").toLowerCase();
  const type = listing.land_type ?? "";
  const photoCount = Array.isArray(listing.photos) ? listing.photos.length : 0;
  const hasGps =
    typeof listing.latitude === "number" &&
    typeof listing.longitude === "number" &&
    !(listing.latitude === 0 && listing.longitude === 0);

  const strengths: string[] = [];
  const risks: string[] = [];

  // ── Price vs comparables (the strongest single signal when we have it) ──
  if (priceInsight) {
    const pct = Math.round(Math.abs(priceInsight.deltaPct));
    if (priceInsight.deltaPct <= -10) {
      strengths.push(`Priced about ${pct}% below similar ${priceInsight.scopeLabel}`);
    } else if (priceInsight.deltaPct >= 20) {
      risks.push(`Priced about ${pct}% above similar ${priceInsight.scopeLabel} — confirm what justifies the premium`);
    }
  }

  // ── Water ──
  if (ASSURED_WATER.includes(water)) {
    strengths.push(`Assured water source (${listing.water_source})`);
  } else if (water === "rainfed" || !water) {
    risks.push(
      water === "rainfed"
        ? "Rainfed only — confirm irrigation or borewell potential before farming"
        : "Water source not listed — confirm what's available on site"
    );
  }

  // ── Road / access ──
  if (GOOD_ROAD.includes(road)) {
    strengths.push(`${listing.road_access} road access`);
  } else if (!road || road === "none" || road === "dirt") {
    risks.push("Limited road access — confirm the approach road and width on site");
  }

  // ── Utilities ──
  if (listing.electricity) strengths.push("Electricity connection available");
  if (listing.fencing) strengths.push("Boundary is fenced");

  // ── Land type ──
  if (CONVERTED.includes(type)) {
    strengths.push("Non-agricultural / converted land — simpler to build on and resell");
  }

  // ── Trust & verification ──
  if (listing.is_verified) {
    strengths.push("Verified by the AcreHub team");
  } else {
    risks.push("Not yet verified by AcreHub — check the documents independently");
  }
  if (hasGps) strengths.push("Exact location pinned on the map");
  else risks.push("Exact plot not pinned on the map — confirm boundaries on the ground");
  if (photoCount === 0) risks.push("No photos yet — ask the seller for photos or a site visit");

  // Title/encumbrance is always worth checking — say so honestly rather than
  // implying completeness means clean ownership.
  risks.push("Confirm clear title, survey number, and encumbrance (EC) with a lawyer");

  // ── Best suited for (reuse the suitability engine; Great first, else Good) ──
  const suit = computeSuitability(listing);
  let bestFor = suit.filter((s) => s.label === "Great").map((s) => s.purpose);
  if (bestFor.length === 0) bestFor = suit.filter((s) => s.label === "Good").map((s) => s.purpose);

  // Keep each list tight and scannable.
  return {
    strengths: strengths.slice(0, 5),
    risks: risks.slice(0, 5),
    bestFor,
  };
}
