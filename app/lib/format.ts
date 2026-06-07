// Indian price formatting. Compact lakh/crore form for list/compact contexts
// (e.g. "₹50 L", "₹1.2 Cr"); use toLocaleString("en-IN") where the exact rupee
// figure matters (e.g. the listing detail hero).

function trimDecimals(x: number): string {
  return x.toFixed(2).replace(/\.?0+$/, "");
}

/** Compact: ₹1.2 Cr / ₹50 L / ₹75,000 */
export function formatINRShort(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!isFinite(n)) return "₹0";
  if (n >= 10000000) return `₹${trimDecimals(n / 10000000)} Cr`;
  if (n >= 100000) return `₹${trimDecimals(n / 100000)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Exact: ₹50,00,000 */
export function formatINR(value: number | string | null | undefined): string {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

// Acres per unit, for normalizing prices to ₹/acre. `bigha` is intentionally
// omitted because it varies by region — we'd rather show nothing than mislead.
const ACRE_PER_UNIT: Record<string, number> = {
  acre: 1,
  guntha: 1 / 40,
  hectare: 2.47105,
  sqft: 1 / 43560,
  cent: 1 / 100,
};

/**
 * Normalized ₹ per acre, for apples-to-apples comparison. Returns null when it
 * can't be derived reliably (e.g. total price with a bigha/unknown area unit).
 */
export function pricePerAcre(listing: {
  price?: number | null;
  price_basis?: string | null;
  area_value?: number | null;
  area_unit?: string | null;
}): number | null {
  const price = Number(listing.price);
  if (!isFinite(price) || price <= 0) return null;

  switch (listing.price_basis) {
    case "per_acre":
      return price;
    case "per_guntha":
      return price * 40;
    case "per_sqft":
      return price * 43560;
    default: {
      // "total" (or unset): derive from area.
      const factor = listing.area_unit ? ACRE_PER_UNIT[listing.area_unit] : undefined;
      const area = Number(listing.area_value);
      if (!factor || !isFinite(area) || area <= 0) return null;
      const acres = area * factor;
      return acres > 0 ? price / acres : null;
    }
  }
}

