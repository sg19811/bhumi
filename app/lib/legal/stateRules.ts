// Loads lawyer-reviewed jurisdiction rules from legal_state_rules.
// Reads via the anon client, so RLS returns ONLY published rows — unpublished
// (draft) states never leak to the public site.

import { supabase } from "@/app/lib/supabase";
import type { JurisdictionRule } from "@/app/lib/legal/types";

export async function getPublishedStateRule(state: string): Promise<JurisdictionRule | null> {
  const { data, error } = await supabase
    .from("legal_state_rules")
    .select("state, state_label, data, reviewed_by, reviewed_at, published")
    .eq("state", state)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as JurisdictionRule;
}

export async function getAllPublishedStates(): Promise<Array<{ state: string; state_label: string }>> {
  const { data } = await supabase
    .from("legal_state_rules")
    .select("state, state_label")
    .eq("published", true)
    .order("state_label");
  return (data ?? []) as Array<{ state: string; state_label: string }>;
}
