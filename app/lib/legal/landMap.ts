import type { LandType } from "@/app/lib/legal/types";

// Maps the marketplace's land_type values (app/lib/land.ts) to the legal
// LandType enum, so a listing can pre-fill the eligibility wizard.
const MARKETPLACE_TO_LEGAL: Record<string, LandType> = {
  agri_land: "agri",
  irrigated_farmland: "agri_irrigated",
  dryland: "agri_dry",
  orchard: "orchard",
  plantation: "plantation",
  farmhouse_land: "farmhouse",
  built_farmhouse: "farmhouse",
  na_converted: "na_converted",
  developed_rural_plot: "developed_rural",
};

export function marketplaceLandTypeToLegal(v?: string | null): LandType | null {
  if (!v) return null;
  return MARKETPLACE_TO_LEGAL[v] ?? null;
}
