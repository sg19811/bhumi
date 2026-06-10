// Service-layer operations. Client-callable under RLS: admin policies allow admin
// writes; members only read (per Phase 3 — member-initiated requests are Phase 4).
// No money flows here — these track scope, cost estimates, approval, and progress.
import { supabase } from "@/app/lib/supabase";
import { logCircleEvent } from "@/app/lib/co-buy/circles/circle-actions";
import { recordAudit } from "@/app/lib/co-buy/audit";
import { serviceCategoryLabel } from "./catalog";

export async function createServiceRequest(input: {
  circle_id: string; opportunity_id?: string | null; service_category: string; title: string;
  description?: string | null; official_fees_estimate?: number; vendor_cost_estimate?: number;
  acrehub_service_fee?: number; fee_model?: string; fee_notes?: string | null; buyer_visible_summary?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase.from("co_buy_service_requests").insert({
    circle_id: input.circle_id, opportunity_id: input.opportunity_id ?? null, service_category: input.service_category,
    title: input.title, description: input.description ?? null, status: "requested",
    official_fees_estimate: input.official_fees_estimate ?? 0, vendor_cost_estimate: input.vendor_cost_estimate ?? 0,
    acrehub_service_fee: input.acrehub_service_fee ?? 0, fee_model: input.fee_model ?? "fixed",
    fee_notes: input.fee_notes ?? null, buyer_visible_summary: input.buyer_visible_summary ?? null,
  }).select("id").maybeSingle();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not create request." };
  await logCircleEvent(input.circle_id, { event_type: "service_update_posted", title: `Service request created: ${serviceCategoryLabel(input.service_category)}` });
  return { ok: true, id: data.id };
}

export async function recordApproval(reqId: string, circleId: string, summary: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_service_requests").update({
    approval_status: "circle_approved", status: "approved", approved_at: new Date().toISOString(),
    approved_by_summary: summary, updated_at: new Date().toISOString(),
  }).eq("id", reqId);
  if (error) return { ok: false, error: error.message };
  await logCircleEvent(circleId, { event_type: "service_update_posted", title: "A service was approved by the circle" });
  await recordAudit({ entity_type: "service_request", entity_id: reqId, action: "approved", after: { approved_by_summary: summary }, notes: "Service approved by circle" });
  return { ok: true };
}

export async function postServiceUpdate(input: {
  service_request_id: string; circle_id: string; title: string; body?: string | null;
  visibility: "internal_only" | "circle_members" | "public_summary"; update_type?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_service_updates").insert({
    service_request_id: input.service_request_id, circle_id: input.circle_id, title: input.title,
    body: input.body ?? null, visibility: input.visibility, update_type: input.update_type ?? "note",
  });
  if (error) return { ok: false, error: error.message };
  if (input.visibility !== "internal_only") {
    await logCircleEvent(input.circle_id, { event_type: "service_update_posted", title: `Service update: ${input.title}`, visibility: "members" });
  }
  return { ok: true };
}

export async function setServiceStatus(reqId: string, circleId: string, status: string): Promise<void> {
  await supabase.from("co_buy_service_requests").update({ status, updated_at: new Date().toISOString(), ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}) }).eq("id", reqId);
  await supabase.from("co_buy_service_updates").insert({ service_request_id: reqId, circle_id: circleId, update_type: "status_change", title: `Status changed to ${status}`, visibility: "circle_members" });
}
