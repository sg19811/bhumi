// Growth event logging. SERVER-ONLY (service-role insert bypasses RLS, so any
// event_type can be written from trusted server code). Mirrors growth_events.
// See growth-engine-spec-aggressive-v2.md §4.

import { supabaseAdmin } from "@/app/lib/supabase-server";

export interface GrowthEventInput {
  event_type: string;
  user_id?: string | null;
  session_id?: string | null;
  asset_id?: string | null;
  share_link_id?: string | null;
  referral_code?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  channel?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  state?: string | null;
  district?: string | null;
  taluka?: string | null;
  land_type?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Insert one growth_event. Returns true on success, false on error — callers
 * can treat analytics logging as best-effort and not fail the request on it.
 */
export async function logGrowthEvent(event: GrowthEventInput): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("growth_events")
    .insert({ ...event, metadata: event.metadata ?? {} });
  return !error;
}
