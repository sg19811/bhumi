// =====================================================
// Acrehub Agent Network — shared TypeScript types
// Spec: docs/agent-network-spec-build-ready.md (section 4)
// Import agent-network types from here, nowhere else.
// =====================================================

// =====================================================
// AGENT TYPES
// =====================================================

export type AgentType =
  | 'village_agent' | 'broker' | 'land_aggregator'
  | 'farm_plot_channel_partner' | 'developer_sales_partner'
  | 'legal_document_consultant' | 'land_consultant' | 'other';

export type VerificationStatus =
  | 'pending_review' | 'phone_verified' | 'id_submitted'
  | 'verified' | 'territory_verified' | 'suspended' | 'rejected';

export type ProfileStatus =
  | 'draft' | 'active' | 'hidden' | 'suspended' | 'archived';

export interface AgentProfile {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  profile_photo_url: string | null;
  city: string | null;
  state: string;
  district: string;
  taluka: string | null;
  languages: string[];
  agent_type: AgentType;
  years_experience: number | null;
  bio: string | null;
  specializations: string[];
  land_types_handled: string[];
  verification_status: VerificationStatus;
  profile_status: ProfileStatus;
  admin_notes: string | null;
  trust_tier: 1 | 2 | 3 | 4 | 5;
  auto_publish_listings: boolean;
  observed_primary_district: string | null;
  observed_primary_taluka: string | null;
  observed_price_min_per_acre: number | null;
  observed_price_max_per_acre: number | null;
  observed_acreage_min: number | null;
  observed_acreage_max: number | null;
  accuracy_score: number;
  recent_submissions_count: number;
  created_at: string;
  updated_at: string;
}

// Safe public projection (matches the public_agents SQL view — no PII).
export interface PublicAgent {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  profile_photo_url: string | null;
  city: string | null;
  state: string;
  district: string;
  taluka: string | null;
  languages: string[];
  agent_type: AgentType;
  years_experience: number | null;
  bio: string | null;
  specializations: string[];
  land_types_handled: string[];
  verification_status: VerificationStatus;
  trust_tier: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

export interface AgentTerritory {
  id: string;
  agent_id: string;
  state: string;
  district: string;
  taluka: string | null;
  villages: string[];
  is_primary: boolean;
  created_at: string;
}

// =====================================================
// WHATSAPP INBOX TYPES
// =====================================================

export type ParsingStatus = 'pending' | 'parsed' | 'parsing_failed' | 'not_a_listing';
export type ParsingConfidence = 'high' | 'medium' | 'low';
export type DuplicateStatus = 'pending' | 'clean' | 'duplicate_suspected' | 'duplicate_confirmed';
export type ProcessedStatus =
  | 'inbox' | 'awaiting_clarification' | 'in_progress'
  | 'listing_drafted' | 'published' | 'rejected'
  | 'duplicate_merged' | 'archived';

export interface WhatsAppInboxRow {
  id: string;
  conversation_id: string;
  sender_phone: string;
  agent_id: string | null;
  raw_message: string;
  voice_note_url: string | null;
  voice_transcript: string | null;
  voice_duration_seconds: number | null;
  media_urls: string[];
  location_lat: number | null;
  location_lng: number | null;
  received_at: string;
  language_detected: string | null;
  parsed_payload: ParsedSubmission | null;
  parsing_status: ParsingStatus;
  parsing_confidence: ParsingConfidence | null;
  parsing_cost_inr: number;
  missing_critical_fields: string[] | null;
  clarification_questions: string[] | null;
  clarification_sent_at: string | null;
  clarification_reply_received: boolean;
  duplicate_check_status: DuplicateStatus;
  duplicate_of_listing_id: string | null;
  similarity_score: number | null;
  price_unusual: boolean;
  district_median_price_per_acre: number | null;
  matched_buyer_requirements: BuyerMatchResult[] | null;
  processed_status: ProcessedStatus;
  resulting_listing_id: string | null;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
}

// =====================================================
// PARSED SUBMISSION TYPES (Claude output schema)
// =====================================================

export type AcreageUnit = 'acres' | 'guntas' | 'cents' | 'ankanam' | 'ground' | 'kuncham';
export type LandType =
  | 'agricultural' | 'farm_plot' | 'farmhouse' | 'large_parcel'
  | 'plantation' | 'warehouse' | 'industrial' | 'other';

export type WaterSource = 'borewell' | 'open_well' | 'river' | 'canal' | 'none' | 'unknown';
export type RoadAccess = 'highway' | 'village_road' | 'kachha' | 'none' | 'unknown';
export type TitleStatus = 'clear' | 'unclear' | 'unknown';
export type ConversionStatus = 'done' | 'pending' | 'not_required' | 'unknown';
export type ElectricityStatus = 'available' | 'not_available' | 'unknown';
export type OwnerConsent = 'unknown' | 'verbal' | 'written' | 'owner_uploaded';

export interface ParsedListing {
  acreage: number | null;
  acreage_unit: AcreageUnit;
  acreage_confidence: ParsingConfidence;
  land_type: LandType;
  location: {
    state: string | null;
    district: string | null;
    taluka: string | null;
    village_or_landmark: string | null;
    survey_number: string | null;
    location_confidence: ParsingConfidence;
  };
  price: {
    total_inr: number | null;
    per_acre_inr: number | null;
    price_confidence: ParsingConfidence;
  };
  features: {
    water: WaterSource;
    road_access: RoadAccess;
    title_status: TitleStatus;
    conversion_status: ConversionStatus;
    electricity: ElectricityStatus;
    fence: boolean | null;
    trees_crops: string | null;
  };
  owner_info: {
    name_mentioned: string | null;
    phone_mentioned: string | null;
    consent_status: OwnerConsent;
  };
  raw_description: string;
  agent_notes_to_admin: string | null;
  missing_critical_fields: string[];
  clarification_questions: string[];
  language_detected: string;
}

export interface ParsedSubmission {
  intent: 'new_listing' | 'status_update' | 'price_change' | 'question' | 'unclear';
  listings: ParsedListing[];
  status_update_details: string | null;
}

// =====================================================
// MATCHING & DUPLICATES
// =====================================================

export interface BuyerMatchResult {
  buyer_interest_id: string;
  match_score: number;
  match_label: 'strong_match' | 'good_match' | 'possible_match';
  match_reasons: string[];
  buyer_phone_masked: string;  // never the full number in payload
}

export interface DuplicateCheckResult {
  is_duplicate_suspected: boolean;
  matched_listing_id: string | null;
  match_type: 'survey_number' | 'gps_proximity' | 'text_similarity' | null;
  similarity_score: number;  // 0.0 to 1.0
  evidence: string;  // human-readable
}

// =====================================================
// LAND RECORDS
// =====================================================

export interface LandRecordRequest {
  state: string;
  district: string;
  taluka: string;
  village: string;
  surveyNumber: string;
  subDivision?: string;
}

export interface LandRecordResult {
  id?: string;
  source: 'manual' | 'landeed' | 'tamilnilam' | 'bhoomi' | 'dharani' |
          'meebhoomi' | 'mahabhulekh' | 'relis' | 'other';
  retrievedAt: string;
  owners: Array<{ name: string; percentage?: number }>;
  extent: { value: number; unit: AcreageUnit | 'sqm' };
  classification: string | null;
  fmbSketchUrl: string | null;
  parentDocument: string | null;
  encumbranceStatus: 'clear' | 'has_encumbrance' | 'unknown' | null;
  rawPayload: object;
  fetchCostInr: number;
}

export interface LandRecordAdapter {
  state: string;
  source: LandRecordResult['source'];
  isAvailable(): boolean;
  fetch(req: LandRecordRequest): Promise<LandRecordResult>;
  costPerFetchInr(): number;
}

// =====================================================
// AGENT APPLICATION (POST /api/agents/apply)
// =====================================================

export interface AgentApplicationInput {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  taluka?: string;
  agent_type: AgentType;
  bio?: string;
  ethics_acknowledged: true;
}

// =====================================================
// SHARED OPTION LISTS / LABELS (form + admin reuse these)
// =====================================================

export const AGENT_TYPES: AgentType[] = [
  'village_agent', 'broker', 'land_aggregator',
  'farm_plot_channel_partner', 'developer_sales_partner',
  'legal_document_consultant', 'land_consultant', 'other',
];

export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  village_agent: 'Village agent',
  broker: 'Broker',
  land_aggregator: 'Land aggregator',
  farm_plot_channel_partner: 'Farm-plot channel partner',
  developer_sales_partner: 'Developer sales partner',
  legal_document_consultant: 'Legal / document consultant',
  land_consultant: 'Land consultant',
  other: 'Other',
};

export const agentTypeLabel = (v: string) =>
  AGENT_TYPE_LABELS[v as AgentType] ?? v.replace(/_/g, ' ');

// Join-form state list (section 8.3).
export const AGENT_STATE_OPTIONS: string[] = [
  'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Maharashtra',
  'Kerala', 'Gujarat', 'Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Others',
];

export const VERIFICATION_STATUSES: VerificationStatus[] = [
  'pending_review', 'phone_verified', 'id_submitted',
  'verified', 'territory_verified', 'suspended', 'rejected',
];

export const PROFILE_STATUSES: ProfileStatus[] = [
  'draft', 'active', 'hidden', 'suspended', 'archived',
];
