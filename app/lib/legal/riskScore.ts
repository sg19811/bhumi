// Land Legal Navigator — visual risk breakdown (rule-based, not ML).
// Spec section 9. Honest framing: we can only estimate from answers; document
// review refines this. Risk is "higher = riskier".

import type { EligibilityAnswers, EligibilityResult, RiskCategory, RiskScore } from "@/app/lib/legal/types";

const UNKNOWN = 50; // medium — we can't assess without documents

// Categories that genuinely need document review to score. Listed as missing data.
const DOC_DEPENDENT: RiskCategory[] = [
  "ownership", "title_chain", "encumbrance", "mutation",
  "survey", "litigation", "access", "family_co_owner", "possession",
];

export function buildRiskScore(
  answers: EligibilityAnswers,
  result: Pick<EligibilityResult, "rationale" | "risk_score" | "confidence">
): RiskScore {
  const fired = new Set(result.rationale.map((r) => r.rule_id));
  const hasBlock = result.rationale.some((r) => r.severity === "block");
  const hasWarn = result.rationale.some((r) => r.severity === "warning");

  const buyerScore = hasBlock
    ? 90
    : hasWarn
      ? 60
      : 15;
  const conversionScore = fired.has("conversion_required") ? 60 : 20;

  const categories = {
    buyer_eligibility: { score: buyerScore, reason: hasBlock ? "A likely restriction was flagged for your buyer type." : hasWarn ? "Conditions may apply to your buyer type." : "No buyer-type restriction detected." },
    conversion_zoning: { score: conversionScore, reason: fired.has("conversion_required") ? "Conversion (NA) likely required for your intended use." : "No conversion flag from your answers." },
    ownership: { score: UNKNOWN, reason: "Needs document review (RTC/7-12, sale deed)." },
    title_chain: { score: UNKNOWN, reason: "Needs the mother-deed chain to assess." },
    encumbrance: { score: UNKNOWN, reason: "Needs an Encumbrance Certificate check." },
    mutation: { score: UNKNOWN, reason: "Needs mutation/khata verification." },
    survey: { score: UNKNOWN, reason: "Needs survey sketch / boundary check." },
    litigation: { score: UNKNOWN, reason: "Needs a litigation / court-record search." },
    access: { score: UNKNOWN, reason: "Needs a road-access / right-of-way check." },
    family_co_owner: { score: UNKNOWN, reason: "Needs a family-tree / co-owner check." },
    possession: { score: UNKNOWN, reason: "Needs a possession / occupancy check." },
    agent_credibility: { score: UNKNOWN, reason: "Verify the seller/agent independently." },
  } satisfies Record<RiskCategory, { score: number; reason: string }>;

  const overall = result.risk_score;
  const level: RiskScore["level"] =
    result.confidence < 40 ? "insufficient_data"
      : overall >= 75 ? "needs_lawyer"
        : overall >= 50 ? "high"
          : overall >= 25 ? "medium"
            : "low";

  const missing_data: string[] = [...DOC_DEPENDENT];
  if (!answers.district) missing_data.push("exact location (district/taluk)");
  if (typeof answers.documents_available !== "boolean") missing_data.push("document availability");

  return { overall, level, categories, data_confidence: result.confidence, missing_data };
}
