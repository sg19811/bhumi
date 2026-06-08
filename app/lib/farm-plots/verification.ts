// Tiered verification for listings. App-level values stored in
// listings.verification_tier (nullable). Null/unknown = unverified. This reflects
// how far AcreHub has checked a listing — it is not a legal guarantee.

export type VerificationTier = "unverified" | "details_verified" | "documents_verified" | "site_verified";

export const VERIFICATION_TIERS: { value: VerificationTier; label: string; short: string; description: string; style: string }[] = [
  { value: "unverified", label: "Not verified", short: "Unverified", description: "AcreHub hasn't verified this listing yet.", style: "bg-gray-100 text-gray-600" },
  { value: "details_verified", label: "Details verified", short: "Details ✓", description: "Listing details and contact have been checked by the AcreHub team.", style: "bg-green-50 text-green-700" },
  { value: "documents_verified", label: "Documents verified", short: "Docs ✓", description: "Key ownership/approval documents have been sighted by the AcreHub team.", style: "bg-green-100 text-green-800" },
  { value: "site_verified", label: "Site verified", short: "Site ✓", description: "An AcreHub representative has physically visited and confirmed the site.", style: "bg-emerald-600 text-white" },
];

export function getTier(value?: string | null) {
  const v = (value as VerificationTier) || "unverified";
  return VERIFICATION_TIERS.find((t) => t.value === v) ?? VERIFICATION_TIERS[0];
}
