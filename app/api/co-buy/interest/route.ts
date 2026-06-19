import { cookies } from "next/headers";
import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { CO_BUY_ACK_KEYS } from "@/app/lib/co-buy/disclaimers";
import { computeLeadScore } from "@/app/lib/co-buy/lead-scoring";
import { recordReferralEvent } from "@/app/lib/referrals";

export const dynamic = "force-dynamic";

// Normalize an Indian phone to +91XXXXXXXXXX where possible.
function normalizePhone(raw: unknown): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d}`;
  if (d.length === 11 && d.startsWith("0")) return `+91${d.slice(1)}`;
  return d ? `+${d}` : "";
}

const toNum = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};
const toArr = (v: unknown): string[] | null => (Array.isArray(v) ? v.map(String).filter(Boolean) : null);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // 1. Every acknowledgement must be exactly boolean true (not truthy).
  for (const key of CO_BUY_ACK_KEYS) {
    if (body[key] !== true) {
      return Response.json({ ok: false, error: "Please confirm all acknowledgements before submitting." }, { status: 400 });
    }
  }

  // 2. Required fields.
  const name = String(body.name ?? "").trim();
  const phone = normalizePhone(body.phone);
  const buyerType = String(body.buyer_type ?? "").trim();
  if (!name || !phone || !buyerType) {
    return Response.json({ ok: false, error: "Name, phone, and buyer type are required." }, { status: 400 });
  }

  // 3. Opportunity must exist and be open.
  const opportunityId = String(body.opportunity_id ?? "");
  const { data: opp } = await db
    .from("co_buy_opportunities")
    .select("id, status, current_interest_count, min_contribution")
    .eq("id", opportunityId)
    .maybeSingle();
  if (!opp || !["open_for_interest", "forming_circle"].includes(opp.status)) {
    return Response.json({ ok: false, error: "This opportunity is not open for interest." }, { status: 400 });
  }

  // 4. NRI/OCI interest is routed to separate legal review automatically.
  const status = buyerType === "nri_oci" ? "nri_legal_review" : "new";

  const acks = Object.fromEntries(CO_BUY_ACK_KEYS.map((k) => [k, true]));

  // Phase 4: compute + store the lead score from the submitted fields.
  const scored = computeLeadScore(
    {
      budget_max: toNum(body.budget_max), timeline: body.timeline ? String(body.timeline) : null,
      phone, whatsapp: body.whatsapp ? String(body.whatsapp) : null,
      desired_share_label: body.desired_share_label ? String(body.desired_share_label) : null,
      site_visit_interest: body.site_visit_interest === true, buyer_type: buyerType,
      coownership_comfort: body.coownership_comfort ? String(body.coownership_comfort) : null,
      service_interests: toArr(body.service_interests), preferred_call_time: body.preferred_call_time ? String(body.preferred_call_time) : null,
      notes: body.notes ? String(body.notes) : null,
    },
    { min_contribution: opp.min_contribution }
  );

  const { data: inserted, error } = await db
    .from("co_buy_interests")
    .insert({
      lead_score: scored.score, lead_score_label: scored.label, lead_score_breakdown: { factors: scored.factors }, lead_score_updated_at: new Date().toISOString(),
      opportunity_id: opportunityId,
      user_id: null,
      buyer_type: buyerType,
      name,
      phone,
      whatsapp: body.whatsapp ? normalizePhone(body.whatsapp) : null,
      email: body.email ? String(body.email).trim() : null,
      city: body.city ? String(body.city).trim() : null,
      budget_min: toNum(body.budget_min),
      budget_max: toNum(body.budget_max),
      desired_share_label: body.desired_share_label ? String(body.desired_share_label) : null,
      desired_contribution: toNum(body.desired_contribution),
      purpose: toArr(body.purpose),
      timeline: body.timeline ? String(body.timeline) : null,
      coownership_comfort: body.coownership_comfort ? String(body.coownership_comfort) : null,
      site_visit_interest: body.site_visit_interest === true,
      service_interests: toArr(body.service_interests),
      preferred_call_time: body.preferred_call_time ? String(body.preferred_call_time) : null,
      notes: body.notes ? String(body.notes).trim() : null,
      ...acks,
      status,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return Response.json({ ok: false, error: "Couldn't save your interest. Please try again." }, { status: 500 });
  }

  // Best-effort denormalized count bump (no per-buyer commitment system).
  await db
    .from("co_buy_opportunities")
    .update({ current_interest_count: (opp.current_interest_count ?? 0) + 1 })
    .eq("id", opportunityId);

  // Referral attribution (best-effort; never blocks the submission).
  const ref = (await cookies()).get("ref")?.value;
  if (ref) {
    await recordReferralEvent({
      referralCode: ref,
      eventType: "co_buy_interest",
      entityType: "co_buy_opportunity",
      entityId: opportunityId,
    });
  }

  return Response.json({ ok: true, id: inserted?.id, status });
}
