// Composite Trust Score (v1) — derived honestly from data we already capture.
// This is NOT a legal verification; it reflects how complete and corroborated a
// listing's details are. Document/encumbrance/identity checks come in v2.

export type TrustTier = "Excellent" | "Good" | "Moderate" | "Needs Verification";

export type TrustSignal = { label: string; met: boolean };

export type TrustResult = {
  score: number; // 0–100
  tier: TrustTier;
  signals: TrustSignal[];
};

export function computeTrust(listing: {
  is_verified?: boolean | null;
  photos?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  description?: string | null;
  owner_user_id?: string | null;
}): TrustResult {
  const hasGps =
    typeof listing.latitude === "number" &&
    typeof listing.longitude === "number" &&
    !(listing.latitude === 0 && listing.longitude === 0);
  const photoCount = Array.isArray(listing.photos) ? listing.photos.length : 0;
  const hasDescription =
    typeof listing.description === "string" && listing.description.trim().length >= 40;

  // Verified is weighted so only team-verified listings can reach "Excellent",
  // and an unverified-but-complete listing tops out at "Good" (max 60).
  const weighted = [
    { label: "Verified by the AcreHub team", met: !!listing.is_verified, weight: 40 },
    { label: "Photos provided", met: photoCount > 0, weight: 15 },
    { label: "Map location pinned (GPS)", met: hasGps, weight: 15 },
    { label: "Contact number on file", met: !!listing.contact_phone, weight: 10 },
    { label: "Detailed description", met: hasDescription, weight: 10 },
    { label: "Posted by a registered account", met: !!listing.owner_user_id, weight: 10 },
  ];

  const score = weighted.reduce((sum, s) => sum + (s.met ? s.weight : 0), 0);
  const tier: TrustTier =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Moderate" : "Needs Verification";

  return { score, tier, signals: weighted.map(({ label, met }) => ({ label, met })) };
}

export const trustTierBadgeStyle: Record<TrustTier, string> = {
  Excellent: "bg-green-100 text-green-800",
  Good: "bg-green-50 text-green-700",
  Moderate: "bg-amber-50 text-amber-700",
  "Needs Verification": "bg-gray-100 text-gray-600",
};

export const trustTierBarColor: Record<TrustTier, string> = {
  Excellent: "bg-green-600",
  Good: "bg-green-500",
  Moderate: "bg-amber-500",
  "Needs Verification": "bg-gray-400",
};
