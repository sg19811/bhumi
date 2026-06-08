// PAN-India city registry for farm-plot projects. This is the source of truth for
// the location hierarchy: India (hub) → city → corridor. Adding a new city is a
// one-line entry here — no new routes or components needed. `status` controls
// whether a city has real content yet ("live") or shows a coming-soon page.
//
// We are targeting Bangalore first, so it is the only `live` city for now; the
// rest are seeded as `coming_soon` so the structure is genuinely PAN-India and
// we never ship thin/empty pages claiming content we don't have.

export type CityStatus = "live" | "coming_soon";

export type City = {
  slug: string;       // matches /farm-plots/[city]
  label: string;      // display name
  state: string;      // state slug → routes legal CTA to /legal/state/[state]
  stateLabel: string; // human-readable state
  region: string;     // grouping for the city menu ("South India", etc.)
  status: CityStatus;
  tagline: string;    // one line under the city name
};

export const CITIES: City[] = [
  // ── Live (focus market) ──────────────────────────────────────────────
  { slug: "bangalore", label: "Bangalore", state: "karnataka", stateLabel: "Karnataka", region: "South India", status: "live", tagline: "Managed, gated & plantation farmland across the city's growth corridors." },

  // ── Coming soon (structure ready; seed real projects to flip to live) ─
  { slug: "hyderabad", label: "Hyderabad", state: "telangana", stateLabel: "Telangana", region: "South India", status: "coming_soon", tagline: "Farm & managed-farmland projects around the city." },
  { slug: "chennai", label: "Chennai", state: "tamil_nadu", stateLabel: "Tamil Nadu", region: "South India", status: "coming_soon", tagline: "Coastal and inland farm plots near the metro." },
  { slug: "coimbatore", label: "Coimbatore", state: "tamil_nadu", stateLabel: "Tamil Nadu", region: "South India", status: "coming_soon", tagline: "Plantation and farm land in the western TN belt." },
  { slug: "kochi", label: "Kochi", state: "kerala", stateLabel: "Kerala", region: "South India", status: "coming_soon", tagline: "Plantation and farmland projects in central Kerala." },
  { slug: "pune", label: "Pune", state: "maharashtra", stateLabel: "Maharashtra", region: "West India", status: "coming_soon", tagline: "Weekend-farm and managed-farmland corridors." },
  { slug: "mumbai", label: "Mumbai (MMR)", state: "maharashtra", stateLabel: "Maharashtra", region: "West India", status: "coming_soon", tagline: "Karjat, Alibaug and the wider weekend-farm belt." },
  { slug: "ahmedabad", label: "Ahmedabad", state: "gujarat", stateLabel: "Gujarat", region: "West India", status: "coming_soon", tagline: "Farm and agricultural land around the metro." },
  { slug: "delhi-ncr", label: "Delhi NCR", state: "haryana", stateLabel: "NCR (multi-state)", region: "North India", status: "coming_soon", tagline: "Farmhouse and farm-plot belts around the capital region." },
  { slug: "kolkata", label: "Kolkata", state: "west_bengal", stateLabel: "West Bengal", region: "East India", status: "coming_soon", tagline: "Farm and agricultural land near the metro." },
];

export const CITY_SLUGS = CITIES.map((c) => c.slug);
export const LIVE_CITIES = CITIES.filter((c) => c.status === "live");

// Region display order for the city menu / hub grid.
export const REGION_ORDER = ["South India", "West India", "North India", "East India"];

export function getCity(slug?: string | null): City | undefined {
  if (!slug) return undefined;
  return CITIES.find((c) => c.slug === slug);
}

export function cityExists(slug?: string | null): boolean {
  return !!getCity(slug);
}

export function cityLabel(slug?: string | null): string {
  return getCity(slug)?.label ?? (slug ?? "").replace(/-/g, " ");
}

/** Cities grouped by region, in REGION_ORDER, for the menu and hub grid. */
export function citiesByRegion(): { region: string; cities: City[] }[] {
  return REGION_ORDER.map((region) => ({
    region,
    cities: CITIES.filter((c) => c.region === region),
  })).filter((g) => g.cities.length > 0);
}
