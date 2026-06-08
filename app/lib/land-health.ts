// Land Health Score — an indicative 0–100 read of a plot's physical and legal
// quality, derived transparently from the listed features (NOT a survey or a
// guarantee). Distinct from the Trust Score (which measures listing completeness)
// and Suitability (what it's good for): this rates the land itself.

export type HealthDimension = { key: string; label: string; score: number; note: string };
export type LandHealth = { score: number; dimensions: HealthDimension[] };

type HealthListing = {
  water_source?: string | null;
  road_access?: string | null;
  electricity?: boolean | null;
  fencing?: boolean | null;
  is_verified?: boolean | null;
  land_type?: string | null;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeLandHealth(listing: HealthListing): LandHealth {
  const water = (listing.water_source ?? "").toLowerCase();
  const road = (listing.road_access ?? "").toLowerCase();
  const type = listing.land_type ?? "";

  // Water security
  const waterScore = ["borewell", "canal", "river"].includes(water) ? 90 : water === "rainfed" ? 55 : 30;
  const waterNote = ["borewell", "canal", "river"].includes(water)
    ? `Assured source (${listing.water_source}).`
    : water === "rainfed" ? "Rainfed — depends on monsoon." : "No water source listed.";

  // Road & connectivity
  const roadScore = road === "highway" ? 95 : road === "paved" ? 80 : road === "dirt" ? 55 : 30;
  const roadNote = road ? `${listing.road_access} access.` : "Access road not specified.";

  // Power & utilities
  const utilScore = clamp(30 + (listing.electricity ? 50 : 0) + (listing.fencing ? 20 : 0));
  const utilNote = listing.electricity
    ? listing.fencing ? "Electricity and fenced boundary." : "Electricity available."
    : listing.fencing ? "Fenced, but no power connection listed." : "No power/fencing listed.";

  // Legal clarity
  const converted = ["na_converted", "developed_rural_plot"].includes(type);
  const legalScore = listing.is_verified ? (converted ? 95 : 90) : converted ? 60 : 45;
  const legalNote = listing.is_verified
    ? "Verified by AcreHub."
    : converted ? "Non-agricultural/converted, but not yet verified." : "Not yet verified — confirm title independently.";

  // Land-use readiness (how usable the parcel is as-listed)
  const fitScore = ["irrigated_farmland", "orchard", "plantation", "agri_land"].includes(type)
    ? 85
    : ["farmhouse_land", "built_farmhouse", "na_converted", "developed_rural_plot"].includes(type)
      ? 75
      : type === "dryland" ? 55 : 50;
  const fitNote = type ? `Listed as ${type.replace(/_/g, " ")}.` : "Land type not specified.";

  const dimensions: HealthDimension[] = [
    { key: "water", label: "Water security", score: clamp(waterScore), note: waterNote },
    { key: "road", label: "Road & connectivity", score: clamp(roadScore), note: roadNote },
    { key: "utilities", label: "Power & utilities", score: clamp(utilScore), note: utilNote },
    { key: "legal", label: "Legal clarity", score: clamp(legalScore), note: legalNote },
    { key: "fit", label: "Land-use readiness", score: clamp(fitScore), note: fitNote },
  ];

  // Weighted overall — water and legal clarity matter most for land.
  const weights: Record<string, number> = { water: 0.25, road: 0.2, utilities: 0.15, legal: 0.25, fit: 0.15 };
  const overall = clamp(dimensions.reduce((sum, d) => sum + d.score * weights[d.key], 0));

  return { score: overall, dimensions };
}
