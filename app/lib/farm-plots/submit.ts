import { corridorExists } from "@/app/lib/farm-plots/corridors";

// Read project columns from a FormData into a DB payload. Only call when the
// land_type is a project type (so non-project listings never send these columns —
// important because the migration may not be applied yet).
export function collectProjectFields(f: FormData): Record<string, unknown> {
  const num = (k: string) => { const v = f.get(k); return v != null && v !== "" ? Number(v) : null; };
  const str = (k: string) => { const v = f.get(k); return v != null && v !== "" ? String(v) : null; };
  return {
    project_name: str("project_name"),
    developer_name: str("developer_name"),
    project_stage: str("project_stage"),
    corridor: str("corridor"),
    nearest_city: "bangalore", // MVP corridors are all Bangalore-region
    distance_from_city_km: num("distance_from_city_km"),
    travel_time_minutes: num("travel_time_minutes"),
    total_project_acres: num("total_project_acres"),
    plot_count: num("plot_count"),
    plot_size_min_value: num("plot_size_min_value"),
    plot_size_max_value: num("plot_size_max_value"),
    plot_size_unit: str("plot_size_unit"),
    maintenance_fee_amount: num("maintenance_fee_amount"),
    maintenance_fee_period: str("maintenance_fee_period"),
    layout_approval_status: str("layout_approval_status"),
    conversion_status: str("conversion_status"),
    possession_timeline: str("possession_timeline"),
    amenities: Array.from(f.getAll("amenities")).map(String),
  };
}

// Defensive validation: only checks values that are present. Returns an error string or null.
export function validateProjectFields(
  p: Record<string, unknown>,
  plots: { size_value: string; price: string }[] = []
): string | null {
  const n = (x: unknown) => (x == null || x === "" ? null : Number(x));
  const dist = n(p.distance_from_city_km);
  if (dist != null && !(dist > 0)) return "Distance from city must be greater than 0.";
  const pc = n(p.plot_count);
  if (pc != null && !(pc > 0)) return "Number of plots must be greater than 0.";
  const smin = n(p.plot_size_min_value);
  const smax = n(p.plot_size_max_value);
  if (smin != null && !(smin > 0)) return "Minimum plot size must be greater than 0.";
  if (smax != null && !(smax > 0)) return "Maximum plot size must be greater than 0.";
  if (smin != null && smax != null && smax < smin) return "Maximum plot size can't be less than the minimum.";
  if (p.corridor && !corridorExists(String(p.corridor))) return "Please pick a corridor from the list.";
  for (const pl of plots) {
    if (pl.size_value !== "" && !(Number(pl.size_value) > 0)) return "Each plot's size must be greater than 0.";
    if (pl.price !== "" && Number(pl.price) < 0) return "Plot price can't be negative.";
  }
  return null;
}

// Map draft plot rows → farm_project_plots insert rows for a listing.
export function plotRowsForInsert(listingId: string, plots: { plot_label: string; size_value: string; size_unit: string; price: string; status: string }[]) {
  return plots
    .filter((p) => Number(p.size_value) > 0)
    .map((p) => ({
      listing_id: listingId,
      plot_label: p.plot_label || null,
      size_value: Number(p.size_value),
      size_unit: p.size_unit,
      price: p.price !== "" ? Number(p.price) : null,
      status: p.status,
    }));
}
