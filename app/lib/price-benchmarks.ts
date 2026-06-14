// Server-only price sanity check (spec 9.3), computed on the fly from active
// listings rather than the deferred price_benchmarks materialized view (this DB
// has no price_per_acre column). Normalizes via pricePerAcre.

import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { pricePerAcre } from "@/app/lib/format";

export interface PriceSanityResult {
  is_unusual: boolean;
  median_price_per_acre: number | null;
  p25_price_per_acre: number | null;
  p75_price_per_acre: number | null;
  sample_size: number;
  z_score_label: string | null;
}

const MIN_SAMPLE = 8;

function pct(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

export async function checkPriceSanity(
  district: string,
  projectLandType: string,
  perAcreValue: number
): Promise<PriceSanityResult> {
  const empty: PriceSanityResult = {
    is_unusual: false, median_price_per_acre: null, p25_price_per_acre: null,
    p75_price_per_acre: null, sample_size: 0, z_score_label: null,
  };
  if (!district || !perAcreValue || perAcreValue <= 0) return empty;

  let q = db.from("listings").select("price, price_basis, area_value, area_unit").eq("status", "active").ilike("district", district);
  if (projectLandType && projectLandType !== "other") q = q.eq("land_type", projectLandType);
  const { data } = await q.limit(500);

  const perAcres = (data ?? [])
    .map((l) => pricePerAcre(l))
    .filter((n): n is number => n != null && n > 0)
    .sort((a, b) => a - b);

  const median = pct(perAcres, 0.5);
  if (perAcres.length < MIN_SAMPLE || median == null) {
    return { ...empty, sample_size: perAcres.length, median_price_per_acre: median != null ? Math.round(median) : null };
  }

  const ratio = perAcreValue / median;
  let is_unusual = false;
  let label: string | null = null;
  if (ratio > 1.5) { is_unusual = true; label = `${Math.round((ratio - 1) * 100)}% above district median`; }
  else if (ratio < 0.5) { is_unusual = true; label = `${Math.round((1 - ratio) * 100)}% below district median`; }

  return {
    is_unusual,
    median_price_per_acre: Math.round(median),
    p25_price_per_acre: Math.round(pct(perAcres, 0.25)!),
    p75_price_per_acre: Math.round(pct(perAcres, 0.75)!),
    sample_size: perAcres.length,
    z_score_label: label,
  };
}
