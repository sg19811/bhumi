// Land Legal Navigator — shared copy (disclaimers, verdict/risk labels).
// Lawyer-review the disclaimer wording before final launch (spec section 14).

import type { Verdict } from "@/app/lib/legal/types";

export const DISCLAIMER_FOOTER =
  "AcreHub provides informational guidance on land laws and document requirements. We are not a law firm and do not provide legal advice. Information on this page is general in nature and may not apply to your specific situation. For decisions involving land purchase, ownership, or any legal action, consult a verified advocate.";

export const DISCLAIMER_RESULT =
  "This eligibility result is generated from the information you provided and our curated database of state land laws. It is informational only and not a legal opinion. Land laws change frequently. Before any purchase decision, please consult a verified land lawyer.";

export const AI_MARKER =
  "This response was generated automatically from a curated knowledge base. It may be incomplete or outdated. We recommend lawyer review for any consequential decision.";

export const PENDING_REVIEW_NOTE =
  "Verified guidance for this state is being finalised with our legal panel. The summary below is a working draft — please confirm specifics with a verified advocate.";

type VerdictMeta = {
  label: string;
  tone: "green" | "amber" | "red" | "grey";
  blurb: string;
};

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  likely_eligible: {
    label: "Likely eligible",
    tone: "green",
    blurb: "Based on your answers, this purchase appears generally permissible. Still have a lawyer verify the documents.",
  },
  with_conditions: {
    label: "Eligible with conditions",
    tone: "amber",
    blurb: "Purchase may be possible, but specific conditions apply. Lawyer review is recommended.",
  },
  needs_approval: {
    label: "Needs approval / review",
    tone: "amber",
    blurb: "This likely requires government permission or careful structuring. Speak to a lawyer before proceeding.",
  },
  high_risk: {
    label: "High risk",
    tone: "red",
    blurb: "Your answers indicate a likely legal restriction. Do not proceed without lawyer review.",
  },
  insufficient_info: {
    label: "Insufficient information",
    tone: "grey",
    blurb: "We don't yet have enough verified data to assess this. A lawyer can give you a definitive answer.",
  },
};

export type Tone = "green" | "amber" | "red" | "grey";

export const toneClasses: Record<Tone, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
  grey: "bg-gray-100 text-gray-600 border-gray-200",
};

export const toneBar: Record<Tone, string> = {
  green: "bg-green-600",
  amber: "bg-amber-500",
  red: "bg-red-500",
  grey: "bg-gray-400",
};

export const RISK_LEVEL_META: Record<
  string,
  { label: string; tone: "green" | "amber" | "red" | "grey" }
> = {
  low: { label: "Low risk", tone: "green" },
  medium: { label: "Medium risk", tone: "amber" },
  high: { label: "High risk", tone: "red" },
  needs_lawyer: { label: "Needs a lawyer", tone: "red" },
  insufficient_data: { label: "Not enough data", tone: "grey" },
};
