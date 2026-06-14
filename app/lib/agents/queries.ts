// Server-safe reads for the public agent directory + profiles.
// Reads the PII-free `public_agents` view (granted to anon) — never the base
// agent_profiles table — so no phone/email/admin_notes is ever exposed publicly.

import { supabase } from "@/app/lib/supabase";
import type { PublicAgent } from "@/app/lib/agent-types";

export type AgentFilters = {
  state?: string;
  district?: string;
  taluka?: string;
  agentType?: string;
};

const PAGE_SIZE = 24;

// Count active listings per agent id (single query, tallied in JS).
async function activeListingCounts(agentIds: string[]): Promise<Record<string, number>> {
  if (agentIds.length === 0) return {};
  const { data } = await supabase
    .from("listings")
    .select("agent_id")
    .eq("status", "active")
    .in("agent_id", agentIds);
  const counts: Record<string, number> = {};
  for (const r of data ?? []) {
    const id = (r as { agent_id: string | null }).agent_id;
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function getPublicAgents(
  filters: AgentFilters = {},
  page = 1
): Promise<{ agents: PublicAgent[]; counts: Record<string, number>; total: number }> {
  let q = supabase.from("public_agents").select("*", { count: "exact" });
  if (filters.state) q = q.eq("state", filters.state);
  if (filters.agentType) q = q.eq("agent_type", filters.agentType);
  if (filters.district) q = q.ilike("district", filters.district);
  if (filters.taluka) q = q.ilike("taluka", filters.taluka);

  const from = (Math.max(1, page) - 1) * PAGE_SIZE;
  q = q.order("trust_tier", { ascending: false }).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data, count } = await q;
  const agents = (data ?? []) as PublicAgent[];
  const counts = await activeListingCounts(agents.map((a) => a.id));
  return { agents, counts, total: count ?? agents.length };
}

export async function getAgentBySlug(
  slug: string
): Promise<{ agent: PublicAgent; listings: Record<string, unknown>[] } | null> {
  const { data: agent } = await supabase.from("public_agents").select("*").eq("slug", slug).maybeSingle();
  if (!agent) return null;

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", (agent as PublicAgent).id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return { agent: agent as PublicAgent, listings: (listings ?? []) as Record<string, unknown>[] };
}

export const AGENTS_PAGE_SIZE = PAGE_SIZE;
