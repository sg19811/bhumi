// Buying Circles — shared types (Phase 1). Mirrors supabase-co-buy.sql.

export type CoBuyStatus =
  | "draft"
  | "legal_screening"
  | "open_for_interest"
  | "forming_circle"
  | "paused"
  | "closed"
  | "cancelled";

export const CO_BUY_PUBLIC_STATUSES: CoBuyStatus[] = ["open_for_interest", "forming_circle"];

export const CO_BUY_STATUS_LABELS: Record<CoBuyStatus, string> = {
  draft: "Draft",
  legal_screening: "Legal screening",
  open_for_interest: "Open for interest",
  forming_circle: "Forming circle",
  paused: "Paused",
  closed: "Closed",
  cancelled: "Cancelled",
};

export type CoBuyInterestStatus =
  | "new"
  | "call_pending"
  | "contacted"
  | "qualified"
  | "not_qualified"
  | "nri_legal_review"
  | "added_to_circle"
  | "dropped"
  | "follow_up_later";

export const CO_BUY_INTEREST_STATUS_LABELS: Record<CoBuyInterestStatus, string> = {
  new: "New",
  call_pending: "Call pending",
  contacted: "Contacted",
  qualified: "Qualified",
  not_qualified: "Not qualified",
  nri_legal_review: "NRI legal review",
  added_to_circle: "Added to circle",
  dropped: "Dropped",
  follow_up_later: "Follow up later",
};

export type CoBuyBuyerType =
  | "indian_resident"
  | "nri_oci"
  | "company_llp"
  | "family_group"
  | "farmer"
  | "investor"
  | "other";

export const CO_BUY_BUYER_TYPES: { value: CoBuyBuyerType; label: string }[] = [
  { value: "indian_resident", label: "Indian resident" },
  { value: "nri_oci", label: "NRI / OCI" },
  { value: "company_llp", label: "Company / LLP" },
  { value: "family_group", label: "Family group" },
  { value: "farmer", label: "Farmer" },
  { value: "investor", label: "Investor" },
  { value: "other", label: "Other" },
];

export type LegalCautionLevel = "standard" | "elevated" | "high";

export type CoBuyOpportunity = {
  id: string;
  listing_id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: CoBuyStatus;
  total_area_value: number | null;
  total_area_unit: string | null;
  total_price: number | null;
  estimated_all_in_cost: number | null;
  price_per_acre: number | null;
  min_contribution: number | null;
  suggested_contribution: number | null;
  max_members: number | null;
  target_members: number | null;
  current_interest_count: number | null;
  current_soft_commitment_amount: number | null;
  legal_caution_level: LegalCautionLevel | null;
  is_nri_allowed: boolean | null;
  site_visit_dates: string[] | null;
  service_layer_enabled: boolean | null;
  public_disclaimer: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CoBuyInterest = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  buyer_type: CoBuyBuyerType | null;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  budget_min: number | null;
  budget_max: number | null;
  desired_share_label: string | null;
  desired_contribution: number | null;
  purpose: string[] | null;
  timeline: string | null;
  coownership_comfort: string | null;
  site_visit_interest: boolean | null;
  service_interests: string[] | null;
  preferred_call_time: string | null;
  notes: string | null;
  status: CoBuyInterestStatus;
  qualification_notes: string | null;
  created_at: string;
  updated_at: string;
};

export const DESIRED_SHARE_OPTIONS: { value: string; label: string }[] = [
  { value: "0.5_acre", label: "About half an acre" },
  { value: "1_acre", label: "About 1 acre" },
  { value: "2_acre", label: "About 2 acres" },
  { value: "5_acre", label: "About 5 acres" },
  { value: "percentage", label: "A percentage share" },
  { value: "budget_based", label: "Whatever my budget allows" },
  { value: "not_sure", label: "Not sure yet" },
];

export const TIMELINE_OPTIONS: { value: string; label: string }[] = [
  { value: "immediate", label: "Immediately" },
  { value: "1_month", label: "Within a month" },
  { value: "3_months", label: "1–3 months" },
  { value: "6_months", label: "3–6 months" },
  { value: "exploring", label: "Just exploring" },
];

export const COOWNERSHIP_COMFORT_OPTIONS: { value: string; label: string }[] = [
  { value: "demarcated_portion", label: "I want my own demarcated portion" },
  { value: "undivided_ok", label: "An undivided share is fine" },
  { value: "explain_first", label: "Explain the options to me first" },
  { value: "wants_call", label: "I'd like a call to discuss" },
  { value: "lawyer_review_first", label: "Only after my lawyer reviews it" },
];
