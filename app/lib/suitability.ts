// Indicative, rule-based "what is this land good for?" ratings derived from the
// listed features. Transparent and conservative — NOT a guarantee or price call.
export type Suitability = { purpose: string; label: "Great" | "Good" | "Limited"; note: string };

const tier = (s: number): Suitability["label"] => (s >= 70 ? "Great" : s >= 40 ? "Good" : "Limited");

export function computeSuitability(listing: {
  water_source?: string | null;
  road_access?: string | null;
  land_type?: string | null;
  electricity?: boolean | null;
  is_verified?: boolean | null;
}): Suitability[] {
  const water = (listing.water_source ?? "").toLowerCase();
  const road = (listing.road_access ?? "").toLowerCase();
  const type = listing.land_type ?? "";
  const elec = !!listing.electricity;
  const verified = !!listing.is_verified;
  const hasWater = ["borewell", "canal", "river"].includes(water);
  const goodRoad = ["highway", "paved"].includes(road);
  const anyRoad = !!road && road !== "none";

  // Farming
  let f = 0;
  if (hasWater) f += 50;
  else if (water === "rainfed") f += 20;
  if (["irrigated_farmland", "agri_land", "orchard", "plantation", "dryland"].includes(type)) f += 35;
  if (anyRoad) f += 15;

  // Farmhouse / weekend home
  let h = 0;
  if (goodRoad) h += 35;
  else if (anyRoad) h += 15;
  if (elec) h += 25;
  if (["farmhouse_land", "built_farmhouse", "na_converted", "developed_rural_plot"].includes(type)) h += 30;
  if (hasWater) h += 10;

  // Investment
  let i = 0;
  if (["na_converted", "developed_rural_plot"].includes(type)) i += 35;
  if (goodRoad) i += 30;
  else if (anyRoad) i += 10;
  if (verified) i += 25;
  if (elec) i += 10;

  return [
    {
      purpose: "Farming",
      label: tier(f),
      note: hasWater ? "Has an assured water source for cultivation." : "Limited water — confirm irrigation options.",
    },
    {
      purpose: "Farmhouse",
      label: tier(h),
      note: goodRoad || elec ? "Reasonable access/utilities for a weekend home." : "Basic access/utilities — may need development.",
    },
    {
      purpose: "Investment",
      label: tier(i),
      note:
        ["na_converted", "developed_rural_plot"].includes(type) || goodRoad
          ? "Conversion/connectivity support resale potential."
          : "Mostly agricultural — a longer-horizon hold.",
    },
  ];
}
