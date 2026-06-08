// Farm-plot Risk Score — an honest, at-a-glance risk read for a project, derived
// only from data we have. It is a decision aid, NOT legal/financial advice and not
// a guarantee. Where the Transparency readout asks "what's disclosed?", this asks
// "what should make a buyer cautious?" and rolls it into one verdict.

export type RiskLevel = "Lower" | "Moderate" | "Elevated";

export type RiskFlag = { label: string; weight: number; note: string };

export type RiskResult = {
  level: RiskLevel;
  score: number;        // 0–100, higher = more caution warranted
  flags: RiskFlag[];    // the factors that contributed
};

const str = (l: Record<string, unknown>, k: string) => {
  const v = l?.[k];
  return v != null && v !== "" ? String(v) : null;
};
const num = (l: Record<string, unknown>, k: string) => {
  const v = l?.[k];
  return typeof v === "number" ? v : v != null && v !== "" ? Number(v) : null;
};

export function projectRisk(listing: Record<string, unknown>): RiskResult {
  const flags: RiskFlag[] = [];

  const conv = str(listing, "conversion_status");
  if (conv === "agricultural") flags.push({ label: "Land is still agricultural", weight: 22, note: "Building usually needs land-use conversion (NA) and plan approval first." });
  else if (conv === "partial") flags.push({ label: "Only partially converted", weight: 12, note: "Confirm exactly which survey numbers are converted." });
  else if (!conv) flags.push({ label: "Conversion status not stated", weight: 12, note: "Check the land classification on the revenue record." });

  const layout = str(listing, "layout_approval_status");
  if (layout === "pending") flags.push({ label: "Layout approval pending", weight: 20, note: "Don't assume approval will come through — verify before paying." });
  else if (!layout || layout === "unknown") flags.push({ label: "Layout approval not confirmed", weight: 12, note: "Ask for and verify the sanctioned layout." });

  const stage = str(listing, "project_stage");
  if (stage === "pre_launch") flags.push({ label: "Pre-launch stage", weight: 14, note: "Nothing is on the ground yet — higher execution risk." });

  const lat = num(listing, "latitude");
  const lon = num(listing, "longitude");
  const hasGps = lat != null && lon != null && !(lat === 0 && lon === 0);
  if (!hasGps) flags.push({ label: "Location not pinned", weight: 12, note: "No GPS pin — get the exact location and survey numbers." });

  if (!listing.is_verified) flags.push({ label: "Not yet verified by AcreHub", weight: 10, note: "Listing details haven't been team-verified." });

  if (!str(listing, "developer_name")) flags.push({ label: "Developer not named", weight: 8, note: "Find out who is behind the project." });

  const score = Math.min(100, flags.reduce((s, f) => s + f.weight, 0));
  const level: RiskLevel = score >= 45 ? "Elevated" : score >= 20 ? "Moderate" : "Lower";

  return { level, score, flags };
}

export const riskLevelStyle: Record<RiskLevel, string> = {
  Lower: "border-green-200 bg-green-50 text-green-800",
  Moderate: "border-amber-200 bg-amber-50 text-amber-800",
  Elevated: "border-red-200 bg-red-50 text-red-800",
};
