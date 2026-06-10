// Post-purchase operations. Admin writes (transition, expenses, proposals) under
// admin RLS; member writes (vote, exit) under their own-row policies. No money moves.
import { supabase } from "@/app/lib/supabase";
import { logCircleEvent } from "@/app/lib/co-buy/circles/circle-actions";
import { allocateExpense, type AllocMember, type AllocMethod } from "./allocation";

export async function transitionToPostPurchase(
  circleId: string,
  input: { registration_date?: string | null; final_purchase_amount?: number | null; sale_deed_doc_url?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_circles").update({
    status: "completed", post_purchase_at: new Date().toISOString(),
    registration_date: input.registration_date ?? null, final_purchase_amount: input.final_purchase_amount ?? null,
    sale_deed_doc_url: input.sale_deed_doc_url ?? null, updated_at: new Date().toISOString(),
  }).eq("id", circleId);
  if (error) return { ok: false, error: error.message };
  await logCircleEvent(circleId, { event_type: "admin_announcement", title: "Circle moved to post-purchase stewardship" });
  return { ok: true };
}

export async function createExpense(
  input: { circle_id: string; category: string; title: string; amount: number; expense_date: string; allocation_method: AllocMethod; paid_by?: string | null; memberIds?: string[]; custom?: Record<string, number> },
  members: AllocMember[]
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_expenses").insert({
    circle_id: input.circle_id, category: input.category, title: input.title, amount: input.amount,
    expense_date: input.expense_date, allocation_method: input.allocation_method, paid_by: input.paid_by ?? "pending",
    allocation_details: { memberIds: input.memberIds ?? [], custom: input.custom ?? {} }, status: "recorded",
  });
  if (error) return { ok: false, error: error.message };

  // Allocate and roll up into member dues for the fiscal year.
  const fy = new Date(input.expense_date).getFullYear() || new Date().getFullYear();
  const alloc = allocateExpense(input.amount, members, input.allocation_method, { memberIds: input.memberIds, custom: input.custom });
  const { data: existing } = await supabase.from("co_buy_member_dues").select("id, member_id, total_allocated").eq("circle_id", input.circle_id).eq("fiscal_year", fy);
  const byMember = new Map((existing ?? []).map((d) => [d.member_id as string, d]));
  for (const [memberId, amt] of Object.entries(alloc)) {
    if (!amt) continue;
    const prev = byMember.get(memberId);
    await supabase.from("co_buy_member_dues").upsert(
      { circle_id: input.circle_id, member_id: memberId, fiscal_year: fy, total_allocated: ((prev?.total_allocated as number) ?? 0) + amt, updated_at: new Date().toISOString() },
      { onConflict: "circle_id,member_id,fiscal_year" }
    );
  }
  return { ok: true };
}

export async function castVote(proposalId: string, memberId: string, vote_value: string, comment?: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_votes").upsert(
    { proposal_id: proposalId, member_id: memberId, vote_value, comment: comment ?? null }, { onConflict: "proposal_id,member_id" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function registerExit(input: { circle_id: string; member_id: string; exit_type: string; expected_price?: number | null; preferred_timeline?: string | null; reason?: string | null }): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("co_buy_exit_interests").insert({
    circle_id: input.circle_id, member_id: input.member_id, exit_type: input.exit_type,
    expected_price: input.expected_price ?? null, preferred_timeline: input.preferred_timeline ?? null, reason: input.reason ?? null, status: "registered",
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
