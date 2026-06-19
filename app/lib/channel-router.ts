// Listing → owned-channel routing. SERVER-ONLY (service-role read). Decides
// which AcreHub channels a listing should auto-post to. Consumed by the Phase 2
// auto-distribution flow. See growth-engine-spec-aggressive-v2.md §11.1.
//
// NOTE: this project's listings have no `state` column — callers that want
// state matching should resolve it via district_to_state and pass it in.

import { supabaseAdmin } from "@/app/lib/supabase-server";
import type { AcrehubOwnedChannel } from "./growth-types";

export interface ChannelMatchInput {
  state?: string | null;
  district?: string | null;
  taluka?: string | null;
  land_type?: string | null;
  nri_friendly?: boolean;
  verified?: boolean;
  co_buy_eligible?: boolean;
}

/** All active, auto-publish channels whose routing rules match the listing. */
export async function findMatchingChannels(listing: ChannelMatchInput): Promise<AcrehubOwnedChannel[]> {
  const { data } = await supabaseAdmin
    .from("acrehub_owned_channels")
    .select("*")
    .eq("status", "active")
    .eq("auto_publish_enabled", true);

  if (!data) return [];

  return (data as AcrehubOwnedChannel[]).filter((c) => {
    // A null routing dimension on the channel means "matches all".
    if (c.target_state && c.target_state !== listing.state) return false;
    if (c.target_district && c.target_district !== listing.district) return false;
    if (c.target_taluka && c.target_taluka !== listing.taluka) return false;
    if (c.target_land_types?.length > 0 && (!listing.land_type || !c.target_land_types.includes(listing.land_type))) return false;
    // Audience gates.
    if (c.target_audience === "nri" && !listing.nri_friendly) return false;
    if (c.target_audience === "verified_only" && !listing.verified) return false;
    if (c.target_audience === "co_buy" && !listing.co_buy_eligible) return false;
    return true;
  });
}
