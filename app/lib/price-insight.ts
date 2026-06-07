import { pricePerAcre } from "@/app/lib/format";

export type PriceInsight = {
  thisPpa: number; // this listing's ₹/acre
  median: number; // median ₹/acre of comparables
  sampleSize: number; // how many comparables informed the median
  scope: "district-type" | "district" | "type"; // what the comparables share
  scopeLabel: string; // human label, e.g. "orchards in Mysuru"
  deltaPct: number; // signed % difference vs median (negative = cheaper)
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export type MarketSummary = {
  median: number;
  min: number;
  max: number;
  sampleSize: number; // listings with a derivable ₹/acre
};

/**
 * Aggregate ₹/acre stats across a set of listings, for region/land landing pages.
 * Returns null with fewer than 3 derivable data points — too thin to be useful.
 */
export function marketSummary(
  listings: Array<Parameters<typeof pricePerAcre>[0]>
): MarketSummary | null {
  const ppas = listings.map((l) => pricePerAcre(l)).filter((p): p is number => !!p);
  if (ppas.length < 3) return null;
  return {
    median: median(ppas),
    min: Math.min(...ppas),
    max: Math.max(...ppas),
    sampleSize: ppas.length,
  };
}

/**
 * Compare a listing's normalized ₹/acre against active comparables. Prefers the
 * tightest comparable set (same district AND land type), then falls back to
 * same district, then same land type. Returns null when there isn't enough
 * comparable data to say anything honest (need ≥3 others with a derivable ₹/acre).
 */
export function buildPriceInsight(
  listing: { district?: string | null; land_type?: string | null } & Parameters<typeof pricePerAcre>[0],
  others: Array<Parameters<typeof pricePerAcre>[0] & { district?: string | null; land_type?: string | null }>,
  landLabel: (t: string) => string
): PriceInsight | null {
  const thisPpa = pricePerAcre(listing);
  if (!thisPpa) return null;

  const withPpa = others
    .map((o) => ({ o, ppa: pricePerAcre(o) }))
    .filter((x): x is { o: typeof x.o; ppa: number } => !!x.ppa);

  const sameDistrict = listing.district
    ? withPpa.filter((x) => x.o.district?.toLowerCase() === listing.district!.toLowerCase())
    : [];
  const sameType = listing.land_type ? withPpa.filter((x) => x.o.land_type === listing.land_type) : [];
  const districtType = sameDistrict.filter((x) => x.o.land_type === listing.land_type);

  let pool: typeof withPpa;
  let scope: PriceInsight["scope"];
  let scopeLabel: string;
  const typeWord = listing.land_type ? landLabel(listing.land_type).toLowerCase() : "land";

  if (districtType.length >= 3 && listing.district) {
    pool = districtType;
    scope = "district-type";
    scopeLabel = `${typeWord} in ${listing.district}`;
  } else if (sameDistrict.length >= 3 && listing.district) {
    pool = sameDistrict;
    scope = "district";
    scopeLabel = `land in ${listing.district}`;
  } else if (sameType.length >= 3) {
    pool = sameType;
    scope = "type";
    scopeLabel = `${typeWord} across listings`;
  } else {
    return null;
  }

  const med = median(pool.map((x) => x.ppa));
  if (!med) return null;

  return {
    thisPpa,
    median: med,
    sampleSize: pool.length,
    scope,
    scopeLabel,
    deltaPct: ((thisPpa - med) / med) * 100,
  };
}
