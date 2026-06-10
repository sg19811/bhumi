// Lightweight audit helper. Client-callable under the admin insert policy on
// acrehub_audit_log. Best-effort — never blocks the action it records.
import { supabase } from "@/app/lib/supabase";

export async function recordAudit(input: {
  entity_type: string; entity_id?: string | null; action: string;
  before?: Record<string, unknown> | null; after?: Record<string, unknown> | null; notes?: string;
}): Promise<void> {
  try {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("acrehub_audit_log").insert({
      actor_user_id: u?.user?.id ?? null,
      entity_type: input.entity_type, entity_id: input.entity_id ?? null, action: input.action,
      before_state: input.before ?? null, after_state: input.after ?? null, notes: input.notes ?? null,
    });
  } catch { /* audit must never break the action */ }
}
