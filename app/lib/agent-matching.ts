// Server-only. Finds buyer requirements that match a (parsed) listing.
// Spec section 9.1, adapted to this project's buyer_interests columns
// (preferred_district/preferred_taluka; land_types in project enum; no state).

import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { maskPhone } from "@/app/lib/phone-utils";
import { mapParsedLandType } from "@/app/lib/whatsapp-to-listing";
import type { BuyerMatchResult } from "@/app/lib/agent-types";

export type MatchInput = {
  district: string;
  taluka: string;
  land_type: string; // parser enum (mapped to project enum internally)
  acreage: number;
  price_per_acre: number | null;
};

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

export async function findMatchingBuyers(input: MatchInput, limit = 3): Promise<BuyerMatchResult[]> {
  const { data: requirements } = await db
    .from("buyer_interests")
    .select("id, status, preferred_district, preferred_taluka, land_types, acreage_min, acreage_max, budget_min, budget_max, contact_phone")
    .limit(200);
  if (!requirements) return [];

  const projectLandType = mapParsedLandType(input.land_type);
  const inDistrict = norm(input.district);
  const inTaluka = norm(input.taluka);

  const scored = requirements
    .filter((r) => norm(r.status) !== "closed" && norm(r.status) !== "fulfilled")
    .map((req): BuyerMatchResult | null => {
      let score = 0;
      const reasons: string[] = [];

      // Geography (required — skip if neither matches).
      if (inTaluka && norm(req.preferred_taluka) === inTaluka) {
        score += 30; reasons.push("same taluka");
      } else if (inDistrict && norm(req.preferred_district) === inDistrict) {
        score += 20; reasons.push("same district");
      } else {
        return null;
      }

      if (Array.isArray(req.land_types) && req.land_types.includes(projectLandType)) {
        score += 20; reasons.push("land type match");
      }

      const acMin = req.acreage_min ?? 0;
      const acMax = req.acreage_max ?? Number.MAX_SAFE_INTEGER;
      if (input.acreage >= acMin && input.acreage <= acMax) {
        score += 15; reasons.push("acreage in range");
      } else if (input.acreage >= acMin * 0.7 && input.acreage <= acMax * 1.3) {
        score += 7; reasons.push("acreage close to range");
      }

      if (input.price_per_acre && req.budget_min && req.budget_max && input.acreage) {
        const total = input.price_per_acre * input.acreage;
        if (total >= req.budget_min && total <= req.budget_max) {
          score += 15; reasons.push("budget in range");
        } else if (total >= req.budget_min * 0.85 && total <= req.budget_max * 1.15) {
          score += 7; reasons.push("budget close to range");
        }
      }

      const match_label: BuyerMatchResult["match_label"] =
        score >= 60 ? "strong_match" : score >= 40 ? "good_match" : "possible_match";

      return {
        buyer_interest_id: req.id,
        match_score: score,
        match_label,
        match_reasons: reasons,
        buyer_phone_masked: maskPhone(req.contact_phone),
      };
    })
    .filter((r): r is BuyerMatchResult => r !== null && r.match_score >= 40)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, Math.min(Math.max(1, limit), 10));

  return scored;
}
