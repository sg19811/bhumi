// Land Legal Navigator — shared types.
// Spec: docs/legal-navigator-spec.md (section 6).
// These mirror the database schema in supabase-legal-navigator.sql.

export type LandType =
  | 'agri' | 'agri_dry' | 'agri_irrigated' | 'plantation' | 'orchard'
  | 'farmhouse' | 'farm_plot' | 'gated_farm' | 'na_converted'
  | 'developed_rural' | 'estate' | 'commercial_rural'
  | 'solar_suitable' | 'warehouse_suitable' | 'eco_tourism';

export type BuyerType =
  | 'farmer_resident' | 'non_farmer_resident' | 'nri' | 'oci'
  | 'company' | 'llp' | 'partnership' | 'trust' | 'huf'
  | 'developer' | 'institutional';

export type Verdict =
  | 'likely_eligible' | 'with_conditions' | 'needs_approval'
  | 'high_risk' | 'insufficient_info';

export type EligibilityAnswers = {
  state: string;
  district?: string;
  taluk?: string;
  village?: string;
  citizenship: 'indian' | 'nri' | 'oci' | 'foreign';
  resident_status: 'resident' | 'non_resident';
  buyer_type: BuyerType;
  farmer_status: 'farmer' | 'non_farmer' | 'inherited_farmer';
  existing_agri_land: boolean;
  land_type: LandType;
  purpose: 'farming' | 'farmhouse' | 'investment' | 'plantation' | 'resort' | 'solar' | 'other';
  budget_range?: '0_25L' | '25_50L' | '50L_1Cr' | '1Cr_5Cr' | '5Cr_plus';
  timeline?: 'within_month' | '1_3_months' | '3_6_months' | '6_plus' | 'just_exploring';
  documents_available?: boolean;
};

export type EligibilityResult = {
  verdict: Verdict;
  confidence: number;       // 0-100
  risk_score: number;       // 0-100, higher = riskier
  headline: string;         // user-facing one-liner
  rationale: Array<{ rule_id: string; reason: string; severity: 'info' | 'warning' | 'block' }>;
  references: Array<{ label: string; url?: string; section?: string }>;
  next_steps: Array<{ id: string; label: string; cta_type: 'lawyer' | 'doc_check' | 'service' | 'article'; cta_target?: string }>;
  needs_lawyer_review: boolean;
};

export type JurisdictionRule = {
  state: string;
  state_label: string;
  data: {
    agri_purchase: { allowed_for: BuyerType[]; restricted_for: BuyerType[]; conditions: string[] };
    nri_rules: { can_purchase_agri: boolean; can_inherit: boolean; restrictions: string[] };
    company_rules: { can_purchase_agri: boolean; conditions: string[] };
    ceiling_limit_acres?: number;
    conversion_required_for: LandType[];
    farmer_status_requirement: 'strict' | 'lenient' | 'none';
    farmhouse_rules: string[];
    common_documents: string[];
    common_risks: string[];
    references: Array<{ label: string; url?: string }>;
  };
  reviewed_by?: string;
  reviewed_at?: string;
  published: boolean;
};

export type RiskCategory =
  | 'buyer_eligibility' | 'ownership' | 'title_chain' | 'encumbrance'
  | 'mutation' | 'survey' | 'litigation' | 'access' | 'conversion_zoning'
  | 'family_co_owner' | 'possession' | 'agent_credibility';

export type RiskScore = {
  overall: number;            // 0-100
  level: 'low' | 'medium' | 'high' | 'needs_lawyer' | 'insufficient_data';
  categories: Record<RiskCategory, { score: number; reason: string }>;
  data_confidence: number;
  missing_data: string[];
};
