// Lead scoring — pure, transparent, stored. A helper for triage, never a verdict.
// Weights are defaults from the spec; tune against real conversion data.

export type LeadScoreLabel = "hot" | "warm" | "needs_qualification" | "legal_review_first" | "low_intent";
export type LeadScoreFactor = { key: string; delta: number; reason: string };
export type LeadScoreResult = { score: number; label: LeadScoreLabel; factors: LeadScoreFactor[] };

type ScoreInterest = {
  budget_max?: number | null; timeline?: string | null; phone?: string | null; whatsapp?: string | null;
  desired_share_label?: string | null; site_visit_interest?: boolean | null; buyer_type?: string | null;
  coownership_comfort?: string | null; service_interests?: string[] | null; preferred_call_time?: string | null; notes?: string | null;
};
type ScoreOpportunity = { min_contribution?: number | null };

export function computeLeadScore(interest: ScoreInterest, opportunity: ScoreOpportunity): LeadScoreResult {
  let score = 50;
  const factors: LeadScoreFactor[] = [];
  const note = (delta: number, key: string, reason: string) => { score += delta; factors.push({ key, delta, reason }); };

  const minContribution = opportunity.min_contribution ?? 0;
  const budgetMax = interest.budget_max ?? 0;

  if (budgetMax >= minContribution && minContribution > 0) note(20, "budget_meets_min", "Budget meets or exceeds minimum contribution");
  if (interest.timeline === "immediate" || interest.timeline === "1_month") note(15, "timeline_short", "Plans to act within 1 month");
  else if (interest.timeline === "3_months") note(10, "timeline_medium", "Plans to act within 3 months");
  if (interest.phone) note(10, "phone_provided", "Phone number provided");
  if (interest.whatsapp) note(5, "whatsapp_provided", "WhatsApp number provided");
  if (interest.desired_share_label && interest.desired_share_label !== "not_sure") note(10, "specific_share", "Specific desired share");
  if (interest.site_visit_interest) note(10, "site_visit_yes", "Interested in a site visit");
  if (interest.buyer_type === "indian_resident") note(10, "resident_buyer", "Indian resident — agricultural land eligible");
  if (interest.coownership_comfort === "undivided_ok" || interest.coownership_comfort === "demarcated_portion") note(10, "coownership_comfort", "Comfortable with co-ownership");
  if (interest.coownership_comfort === "lawyer_review_first") note(5, "wants_lawyer", "Open to lawyer review");
  if ((interest.service_interests?.length ?? 0) > 0) note(5, "service_interest", "Interested in AcrehubIndia services");

  if (interest.buyer_type === "nri_oci") note(-30, "nri_oci", "NRI/OCI — legal review required for agricultural land");
  if (interest.timeline === "exploring") note(-20, "exploratory_only", "Exploration mode only");
  if (minContribution > 0 && budgetMax < minContribution * 0.7) note(-15, "budget_below_min", "Budget significantly below minimum");
  if (!interest.phone) note(-15, "no_phone", "No phone — limited contactability");
  if (!interest.preferred_call_time) note(-5, "no_call_time", "No preferred call time");
  const noteText = (interest.notes ?? "").toLowerCase();
  if (noteText.includes("guarantee") || noteText.includes("assured return")) note(-10, "unrealistic_expectations", "Notes suggest unrealistic expectations");

  score = Math.max(0, Math.min(100, score));

  let label: LeadScoreLabel;
  if (interest.buyer_type === "nri_oci") label = "legal_review_first";
  else if (score >= 80) label = "hot";
  else if (score >= 60) label = "warm";
  else if (score >= 40) label = "needs_qualification";
  else label = "low_intent";

  return { score, label, factors };
}

export const LEAD_SCORE_BADGE: Record<LeadScoreLabel, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-amber-100 text-amber-700",
  needs_qualification: "bg-blue-50 text-blue-700",
  legal_review_first: "bg-purple-100 text-purple-700",
  low_intent: "bg-gray-100 text-gray-500",
};
export const LEAD_SCORE_LABEL_TEXT: Record<LeadScoreLabel, string> = {
  hot: "Hot", warm: "Warm", needs_qualification: "Needs qualification", legal_review_first: "Legal review first", low_intent: "Low intent",
};
