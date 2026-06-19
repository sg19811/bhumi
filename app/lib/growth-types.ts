// Growth Engine — shared types. Mirrors supabase-growth-engine-phase1.sql
// (the applied, revised schema). See docs/growth-engine-spec-aggressive-v2.md.

export type AssetType =
  | "listing" | "agent" | "requirement" | "co_buy" | "guide" | "channel";

export type AssetStatus =
  | "draft" | "ready" | "distributed" | "paused" | "archived";

export type ReferralType =
  | "buyer" | "seller" | "agent" | "developer" | "aggregator" | "internal";

export type ReferralStatus = "active" | "paused" | "blocked";

export type ReferralEventType =
  | "signup" | "agent_joined" | "requirement_submitted"
  | "enquiry_submitted" | "co_buy_interest" | "listing_created" | "click";

export type ShareChannel =
  | "whatsapp" | "telegram" | "email" | "sms" | "qr"
  | "agent_share" | "direct" | "seo" | "referral";

export type TemplateType =
  | "whatsapp" | "telegram" | "email" | "sms" | "social"
  | "poster" | "listing_card" | "agent_card";

export type ChannelKind =
  | "telegram_channel" | "telegram_group"
  | "whatsapp_community" | "whatsapp_community_subgroup"
  | "email_list";

export type ChannelAudience =
  | "nri" | "co_buy" | "verified_only" | "farm_plot"
  | "warehouse" | "general";

export interface DistrictToState {
  district: string;
  state: string;
}

export interface GrowthAsset {
  id: string;
  asset_type: AssetType;
  entity_id: string;
  title: string | null;
  public_url: string;
  short_description: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  land_type: string | null;
  price_text: string | null;
  trust_label: string | null;
  image_url: string | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  user_id: string | null;
  agent_id: string | null;        // → agent_profiles.id (directory record)
  referral_type: ReferralType;
  status: ReferralStatus;
  created_at: string;
}

export interface ReferralEvent {
  id: string;
  referral_code: string | null;
  referrer_user_id: string | null;
  referred_user_id: string | null;
  event_type: ReferralEventType;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ShareLink {
  id: string;
  short_code: string;
  target_url: string;
  asset_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  referral_code: string | null;
  channel: ShareChannel | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  created_by: string | null;
  click_count: number;
  last_clicked_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrowthEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  session_id: string | null;
  asset_id: string | null;
  share_link_id: string | null;
  referral_code: string | null;
  entity_type: string | null;
  entity_id: string | null;
  channel: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  land_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContactPreference {
  id: string;
  user_id: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  opt_in_whatsapp: boolean;
  opt_in_email: boolean;
  opt_in_sms: boolean;
  opt_in_telegram: boolean;
  opt_in_source: string | null;
  opt_in_at: string | null;
  opt_out_at: string | null;
  preferred_language: string;
  preferred_states: string[];
  preferred_districts: string[];
  preferred_land_types: string[];
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  template_name: string;
  template_type: TemplateType;
  language: string;
  template_body: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcrehubOwnedChannel {
  id: string;
  channel_kind: ChannelKind;
  name: string;
  slug: string;
  description: string | null;
  public_join_url: string | null;
  internal_id: string | null;
  bot_token_env_var: string | null;
  target_state: string | null;
  target_district: string | null;
  target_taluka: string | null;
  target_land_types: string[];
  target_audience: ChannelAudience | null;
  auto_publish_enabled: boolean;
  approval_required: boolean;
  daily_post_limit: number;
  status: "active" | "paused" | "archived";
  member_count: number;
  last_member_count_refresh: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentShareGroup {
  id: string;
  agent_user_id: string;   // → auth.users (the logged-in agent), not agent_profiles
  label: string;
  notes: string | null;
  created_at: string;
}
