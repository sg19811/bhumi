// Pure mapping from a parsed WhatsApp listing → an editable listing draft that
// matches this project's real `listings` columns. The admin reviews/edits the
// draft before publishing, so best-effort mappings (with sensible fallbacks) are
// fine — unmapped values default to a safe choice the admin can correct.

import type { ParsedListing } from "@/app/lib/agent-types";
import { landLabel } from "@/app/lib/land";

export type ListingDraft = {
  title: string;
  description: string;
  land_type: string;
  price: number | null;
  price_basis: string;
  area_value: number | null;
  area_unit: string;
  district: string;
  taluka: string;
  village: string;
  latitude: number | null;
  longitude: number | null;
  water_source: string;
  road_access: string;
  electricity: boolean;
  survey_number: string;
  location_visibility: string;
  survey_number_visibility: string;
};

// Parsed land_type enum → this project's land_type values (app/lib/land.ts).
const LAND_TYPE_MAP: Record<string, string> = {
  agricultural: "agri_land",
  farm_plot: "farm_plot_project",
  farmhouse: "farmhouse_land",
  large_parcel: "agri_land",
  plantation: "plantation",
  warehouse: "other",
  industrial: "other",
  other: "other",
};

// Parsed acreage_unit → listings area_unit (rare units default to acre; editable).
const AREA_UNIT_MAP: Record<string, string> = {
  acres: "acre",
  guntas: "guntha",
  cents: "cent",
  ankanam: "acre",
  ground: "acre",
  kuncham: "acre",
};

const WATER_MAP: Record<string, string> = {
  borewell: "borewell",
  open_well: "borewell",
  river: "river",
  canal: "canal",
  none: "none",
  unknown: "",
};

const ROAD_MAP: Record<string, string> = {
  highway: "highway",
  village_road: "paved",
  kachha: "dirt",
  none: "none",
  unknown: "",
};

// Map a parser land_type (e.g. "agricultural") to this project's land_type
// (e.g. "agri_land"). Shared with buyer matching so enums line up.
export function mapParsedLandType(parsedLandType: string): string {
  return LAND_TYPE_MAP[parsedLandType] ?? "other";
}

export function parsedToDraft(
  l: ParsedListing,
  coords?: { latitude: number | null; longitude: number | null }
): ListingDraft {
  const land_type = LAND_TYPE_MAP[l.land_type] ?? "other";
  const place = l.location?.village_or_landmark || l.location?.taluka || l.location?.district || "";
  const acreageStr = l.acreage != null ? `${l.acreage} ${l.acreage_unit}` : "";
  const title = [acreageStr, landLabel(land_type), place && `in ${place}`].filter(Boolean).join(" ").trim() || "Land for sale";

  const hasTotal = l.price?.total_inr != null;
  const price = hasTotal ? l.price!.total_inr : l.price?.per_acre_inr ?? null;
  const price_basis = hasTotal ? "total" : l.price?.per_acre_inr != null ? "per_acre" : "total";

  return {
    title,
    description: l.raw_description ?? "",
    land_type,
    price,
    price_basis,
    area_value: l.acreage,
    area_unit: AREA_UNIT_MAP[l.acreage_unit] ?? "acre",
    district: l.location?.district ?? "",
    taluka: l.location?.taluka ?? "",
    village: l.location?.village_or_landmark ?? "",
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    water_source: WATER_MAP[l.features?.water] ?? "",
    road_access: ROAD_MAP[l.features?.road_access] ?? "",
    electricity: l.features?.electricity === "available",
    survey_number: l.location?.survey_number ?? "",
    // Survey number often sensitive; default to qualified-buyer visibility.
    location_visibility: "public",
    survey_number_visibility: "qualified_buyer_only",
  };
}

// Normalize a survey number for the survey_number_clean column (strip punctuation/space, uppercase).
export function cleanSurveyNumber(s: string | null | undefined): string | null {
  if (!s) return null;
  const c = s.replace(/[\s\-/]+/g, "").toUpperCase();
  return c || null;
}
