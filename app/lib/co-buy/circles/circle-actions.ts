// Circle operations. These run client-side under RLS: admin policies allow the
// admin writes (create circle, seed, add member); the member RSVP policy allows a
// member to write their own RSVP. No service role needed.
import { supabase } from "@/app/lib/supabase";
import { MILESTONE_TEMPLATES } from "./milestone-templates";
import { documentsForState } from "./state-document-templates";

export async function logCircleEvent(
  circleId: string,
  e: { event_type: string; title: string; body?: string; visibility?: "members" | "internal_only"; payload?: Record<string, unknown> }
) {
  try {
    await supabase.from("co_buy_events").insert({
      circle_id: circleId, event_type: e.event_type, title: e.title, body: e.body ?? null,
      visibility: e.visibility ?? "members", payload: e.payload ?? {},
    });
  } catch { /* events are best-effort */ }
}

type FirstMember = { interest_id?: string | null; user_id?: string | null; display_name: string; desired_share_label?: string | null; soft_commitment_amount?: number | null };

export async function createCircle(input: {
  opportunity_id: string; name: string; slug: string; state?: string | null;
  target_members?: number | null; target_amount?: number | null; firstMember?: FirstMember;
}): Promise<{ ok: boolean; id?: string; slug?: string; error?: string }> {
  const { data: circle, error } = await supabase
    .from("co_buy_circles")
    .insert({
      opportunity_id: input.opportunity_id, name: input.name, slug: input.slug,
      status: "forming", target_members: input.target_members ?? null, target_amount: input.target_amount ?? null,
      current_members: input.firstMember ? 1 : 0,
    })
    .select("id, slug")
    .maybeSingle();
  if (error || !circle) return { ok: false, error: error?.message ?? "Could not create circle." };

  // Seed milestones (first one in progress).
  try {
    await supabase.from("co_buy_milestones").insert(
      MILESTONE_TEMPLATES.map((m, i) => ({
        circle_id: circle.id, milestone_key: m.milestone_key, title: m.title, description: m.description,
        status: i === 0 ? "in_progress" : "pending", sort_order: i,
      }))
    );
  } catch { /* best-effort */ }

  // Seed state document checklist.
  try {
    await supabase.from("co_buy_documents").insert(
      documentsForState(input.state).map((d) => ({ circle_id: circle.id, doc_type: d.doc_type, status: "pending" }))
    );
  } catch { /* best-effort */ }

  // First member + interest status.
  if (input.firstMember) {
    try {
      await supabase.from("co_buy_circle_members").insert({
        circle_id: circle.id, interest_id: input.firstMember.interest_id ?? null, user_id: input.firstMember.user_id ?? null,
        display_name: input.firstMember.display_name, desired_share_label: input.firstMember.desired_share_label ?? null,
        soft_commitment_amount: input.firstMember.soft_commitment_amount ?? 0, member_status: "active",
      });
      if (input.firstMember.interest_id) {
        await supabase.from("co_buy_interests").update({ status: "added_to_circle" }).eq("id", input.firstMember.interest_id);
      }
    } catch { /* best-effort */ }
  }

  await logCircleEvent(circle.id, { event_type: "circle_created", title: `Circle "${input.name}" created` });
  return { ok: true, id: circle.id, slug: circle.slug };
}

export async function addMemberFromInterest(
  circleId: string,
  m: FirstMember
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_circle_members").insert({
    circle_id: circleId, interest_id: m.interest_id ?? null, user_id: m.user_id ?? null,
    display_name: m.display_name, desired_share_label: m.desired_share_label ?? null,
    soft_commitment_amount: m.soft_commitment_amount ?? 0, member_status: "active",
  });
  if (error) return { ok: false, error: error.message };
  if (m.interest_id) await supabase.from("co_buy_interests").update({ status: "added_to_circle" }).eq("id", m.interest_id);
  await logCircleEvent(circleId, { event_type: "member_joined", title: "A new member joined the circle" });
  return { ok: true };
}

export async function submitRsvp(
  siteVisitId: string, memberId: string, rsvp_status: string, attendees_count: number, notes?: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_site_visit_rsvps").upsert(
    { site_visit_id: siteVisitId, member_id: memberId, rsvp_status, attendees_count, notes: notes ?? null, responded_at: new Date().toISOString() },
    { onConflict: "site_visit_id,member_id" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}
