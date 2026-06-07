// Land Legal Navigator — eligibility engine (pure, server-side).
// Spec sections 8 & 9. Conservative principle: when in doubt, downgrade the
// verdict and recommend lawyer review.

import type {
  EligibilityAnswers,
  EligibilityResult,
  JurisdictionRule,
  Verdict,
} from "@/app/lib/legal/types";
import { stateLabel } from "@/app/lib/legal/options";

const AGRI_TYPES = ["agri", "agri_dry", "agri_irrigated", "plantation", "orchard"];
const CORE_AGRI = ["agri", "agri_dry", "agri_irrigated"];

type Rationale = EligibilityResult["rationale"];

/** Returned when we have no published, lawyer-reviewed rule for the state. */
export function insufficientForUncoveredState(answers: EligibilityAnswers): EligibilityResult {
  const label = stateLabel(answers.state);
  return {
    verdict: "insufficient_info",
    confidence: 20,
    risk_score: 60,
    headline: `We're finalising verified guidance for ${label}.`,
    rationale: [
      {
        rule_id: "state_not_published",
        reason: `Our lawyer-reviewed rules for ${label} aren't published yet, so we can't give a definitive eligibility read. A verified lawyer can answer this today.`,
        severity: "warning",
      },
    ],
    references: [],
    next_steps: [
      { id: "lawyer", label: "Talk to a verified lawyer", cta_type: "lawyer", cta_target: "/legal/talk-to-lawyer" },
      { id: "checklist", label: "See the document checklist", cta_type: "doc_check", cta_target: "/legal/checklist" },
    ],
    needs_lawyer_review: true,
  };
}

export function computeEligibility(
  answers: EligibilityAnswers,
  rule: JurisdictionRule
): EligibilityResult {
  const rationale: Rationale = [];
  let needsLawyer = false;
  let blocks = 0;
  let warnings = 0;

  // Rule 1: NRI/OCI buying agricultural land
  if ((answers.citizenship === "nri" || answers.citizenship === "oci") && AGRI_TYPES.includes(answers.land_type)) {
    if (!rule.data.nri_rules.can_purchase_agri) {
      rationale.push({
        rule_id: "nri_no_agri",
        reason: `NRI/OCI buyers generally cannot purchase agricultural, plantation, or farmhouse land in ${rule.state_label} (RBI/FEMA rules). Inheritance and NA-converted land are different — verify with a lawyer.`,
        severity: "block",
      });
      blocks++;
    } else {
      rationale.push({
        rule_id: "nri_conditional_agri",
        reason: "NRI/OCI purchase may be possible with RBI approval. Verify with a lawyer.",
        severity: "warning",
      });
      warnings++;
      needsLawyer = true;
    }
  }

  // Rule 2: Non-farmer resident buying core agricultural land
  if (answers.buyer_type === "non_farmer_resident" && CORE_AGRI.includes(answers.land_type)) {
    if (rule.data.farmer_status_requirement === "strict") {
      rationale.push({
        rule_id: "farmer_status_required",
        reason: `${rule.state_label} requires farmer status to purchase agricultural land directly. A permission route or NA-converted land may be alternatives.`,
        severity: "block",
      });
      blocks++;
    } else if (rule.data.farmer_status_requirement === "lenient") {
      rationale.push({
        rule_id: "farmer_status_conditional",
        reason: "Purchase may be allowed under specific conditions or with permission. Confirm the current rule with a lawyer.",
        severity: "warning",
      });
      warnings++;
      needsLawyer = true;
    }
  }

  // Rule 3: Company/LLP/Trust/Partnership buying agricultural land
  if (["company", "llp", "trust", "partnership"].includes(answers.buyer_type) && CORE_AGRI.includes(answers.land_type)) {
    if (!rule.data.company_rules.can_purchase_agri) {
      rationale.push({
        rule_id: "company_no_agri",
        reason: `Companies/LLPs/trusts generally cannot purchase agricultural land in ${rule.state_label} without specific government permission.`,
        severity: "block",
      });
      blocks++;
    } else {
      rationale.push({
        rule_id: "company_conditional_agri",
        reason: "Entity purchase may require specific approvals. Lawyer review recommended.",
        severity: "warning",
      });
      warnings++;
      needsLawyer = true;
    }
  }

  // Rule 4: Conversion (NA) required for the intended non-farming use
  if (rule.data.conversion_required_for.includes(answers.land_type) && ["investment", "resort", "solar"].includes(answers.purpose)) {
    rationale.push({
      rule_id: "conversion_required",
      reason: "Land conversion (NA permission) is typically required for this intended use. Factor in time, cost, and zoning approval.",
      severity: "warning",
    });
    warnings++;
  }

  // Rule 5: Foreign nationals — almost always blocked for agri land
  if (answers.citizenship === "foreign" && AGRI_TYPES.includes(answers.land_type)) {
    rationale.push({
      rule_id: "foreign_no_agri",
      reason: "Foreign nationals are generally barred from owning agricultural land in India. This needs specialist legal advice.",
      severity: "block",
    });
    blocks++;
  }

  // Rule 6: Ceiling-limit reminder when buyer already holds agri land
  if (answers.existing_agri_land && CORE_AGRI.includes(answers.land_type) && rule.data.ceiling_limit_acres) {
    rationale.push({
      rule_id: "ceiling_check",
      reason: `${rule.state_label} applies land-ceiling limits (around ${rule.data.ceiling_limit_acres} acres for an individual — verify the current figure). Since you already hold agricultural land, check your aggregate holding.`,
      severity: "info",
    });
  }

  // Verdict
  let verdict: Verdict;
  if (blocks > 0) verdict = "high_risk";
  else if (warnings >= 2) verdict = "needs_approval";
  else if (warnings === 1) verdict = "with_conditions";
  else verdict = "likely_eligible";

  const confidence = computeConfidence(answers);
  if (confidence < 40 && verdict === "likely_eligible") verdict = "insufficient_info";

  const risk_score = computeRiskScoreNumber(blocks, warnings, confidence);

  return {
    verdict,
    confidence,
    risk_score,
    headline: headlineFor(verdict, rule.state_label),
    rationale,
    references: rule.data.references ?? [],
    next_steps: generateNextSteps(verdict, needsLawyer, answers),
    needs_lawyer_review: needsLawyer || verdict !== "likely_eligible",
  };
}

export function computeConfidence(answers: EligibilityAnswers): number {
  let c = 55;
  if (answers.district) c += 8;
  if (answers.taluk || answers.village) c += 5;
  if (answers.budget_range) c += 7;
  if (answers.timeline) c += 7;
  if (typeof answers.documents_available === "boolean") c += 8;
  if (answers.land_type && answers.purpose) c += 5;
  return Math.max(0, Math.min(100, c));
}

// risk_score: higher = riskier (matches EligibilityResult.risk_score semantics).
export function computeRiskScoreNumber(blocks: number, warnings: number, confidence: number): number {
  const risk = blocks * 30 + warnings * 15 + (100 - confidence) * 0.2;
  return Math.max(0, Math.min(100, Math.round(risk)));
}

export function headlineFor(verdict: Verdict, stateLbl: string): string {
  switch (verdict) {
    case "likely_eligible":
      return `You're likely eligible to buy this land in ${stateLbl}.`;
    case "with_conditions":
      return `You can likely buy in ${stateLbl}, with some conditions.`;
    case "needs_approval":
      return `This purchase in ${stateLbl} likely needs approval or restructuring.`;
    case "high_risk":
      return `There's a likely legal restriction on this purchase in ${stateLbl}.`;
    default:
      return `We need a bit more to assess eligibility in ${stateLbl}.`;
  }
}

function generateNextSteps(verdict: Verdict, needsLawyer: boolean, answers: EligibilityAnswers): EligibilityResult["next_steps"] {
  const steps: EligibilityResult["next_steps"] = [];
  if (verdict !== "likely_eligible" || needsLawyer) {
    steps.push({ id: "lawyer", label: "Talk to a verified lawyer", cta_type: "lawyer", cta_target: "/legal/talk-to-lawyer" });
  } else {
    steps.push({ id: "lawyer_verify", label: "Have a lawyer verify the documents", cta_type: "lawyer", cta_target: "/legal/talk-to-lawyer" });
  }
  steps.push({ id: "checklist", label: "Get your document checklist", cta_type: "doc_check", cta_target: `/legal/checklist?state=${answers.state}&land_type=${answers.land_type}` });
  steps.push({ id: "dd", label: "Run the 10-step due-diligence guide", cta_type: "service", cta_target: "/legal/due-diligence" });
  steps.push({ id: "article", label: "Read: how to verify land ownership", cta_type: "article", cta_target: "/legal/articles/how-to-verify-land-ownership" });
  return steps;
}
