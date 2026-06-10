// Buying Circles Phase 2 — shared types. Mirrors supabase-co-buy-phase-2.sql.

export type CircleStatus =
  | "forming" | "threshold_pending" | "threshold_reached" | "site_visit_scheduled"
  | "legal_review" | "negotiation" | "agreement_drafting" | "registration_planning"
  | "completed" | "cancelled" | "archived";

export const CIRCLE_STATUS_LABELS: Record<CircleStatus, string> = {
  forming: "Forming", threshold_pending: "Threshold pending", threshold_reached: "Threshold reached",
  site_visit_scheduled: "Site visit scheduled", legal_review: "Legal review", negotiation: "Negotiation",
  agreement_drafting: "Agreement drafting", registration_planning: "Registration planning",
  completed: "Completed", cancelled: "Cancelled", archived: "Archived",
};

export type MemberStatus = "invited" | "active" | "paused" | "withdrawn" | "removed";
export type IdentityVisibility = "first_name_city" | "full_name" | "masked";
export type DocStatus = "pending" | "in_review" | "received" | "verified" | "flagged" | "not_required";
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "skipped" | "blocked";
export type SiteVisitStatus = "proposed" | "confirmed" | "completed" | "cancelled" | "rescheduled";
export type RsvpStatus = "pending" | "attending" | "not_attending" | "maybe";
export type TaskStatus = "open" | "in_progress" | "done" | "blocked" | "cancelled";

export const DOC_STATUS_DISPLAY: Record<DocStatus, string> = {
  pending: "⏳ Pending", in_review: "🔍 In review", received: "✅ Received",
  verified: "✅ Verified", flagged: "⚠️ Flagged", not_required: "— Not required",
};

export type CoBuyCircle = {
  id: string; opportunity_id: string; slug: string; name: string; status: CircleStatus;
  target_amount: number | null; current_soft_commitment_amount: number | null;
  target_members: number | null; current_members: number | null;
  lawyer_name: string | null; lawyer_status: string | null; legal_structure: string | null;
  legal_status: string | null; milestone_stage: string | null; whatsapp_group_link: string | null;
  private_summary: string | null; admin_notes: string | null; created_at: string; updated_at: string;
};

export type CircleMember = {
  id: string; circle_id: string; interest_id: string | null; user_id: string | null;
  display_name: string; identity_visibility: IdentityVisibility; desired_share_label: string | null;
  soft_commitment_amount: number | null; member_status: MemberStatus; notes: string | null;
};

export type CircleDocument = {
  id: string; circle_id: string; doc_type: string; status: DocStatus;
  admin_notes: string | null; buyer_visible_note: string | null; flagged_concern: string | null;
};

export type CircleMilestone = {
  id: string; circle_id: string; milestone_key: string; title: string; description: string | null;
  status: MilestoneStatus; target_date: string | null; completed_at: string | null; sort_order: number;
};

export type CircleSiteVisit = {
  id: string; circle_id: string; scheduled_date: string | null; meeting_point: string | null;
  duration_minutes: number | null; transport_notes: string | null; status: SiteVisitStatus;
  field_coordinator_name: string | null; post_visit_summary: string | null; post_visit_media_urls: string[] | null;
};
