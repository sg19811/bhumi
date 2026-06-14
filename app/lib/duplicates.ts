// Server-only. Detects whether a (parsed) listing likely duplicates an existing
// active listing — by survey number, GPS proximity, or description similarity.
// Spec section 9.2, adapted: this project's listings use `village` +
// `survey_number_clean` and have no `state` column.

import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { cleanSurveyNumber } from "@/app/lib/whatsapp-to-listing";
import type { DuplicateCheckResult } from "@/app/lib/agent-types";

export type DupCheckInput = {
  district: string;
  taluka: string;
  village: string;
  survey_number: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
};

const GPS_MATCH_DISTANCE_METERS = 200;
const TEXT_SIMILARITY_THRESHOLD = 0.4;

const NONE: DuplicateCheckResult = {
  is_duplicate_suspected: false,
  matched_listing_id: null,
  match_type: null,
  similarity_score: 0,
  evidence: "No duplicates found",
};

export async function checkDuplicate(input: DupCheckInput): Promise<DuplicateCheckResult> {
  // 1. Same survey number in the same village/district.
  const surveyClean = cleanSurveyNumber(input.survey_number);
  if (surveyClean && input.district) {
    let q = db.from("listings").select("id, title").eq("status", "active").eq("district", input.district).eq("survey_number_clean", surveyClean);
    if (input.village) q = q.eq("village", input.village);
    const { data } = await q.limit(1);
    if (data && data.length > 0) {
      return {
        is_duplicate_suspected: true,
        matched_listing_id: data[0].id,
        match_type: "survey_number",
        similarity_score: 1,
        evidence: `Same survey number (${surveyClean})${input.village ? ` in ${input.village}` : ""}, ${input.district}: "${data[0].title}"`,
      };
    }
  }

  // 2. GPS proximity (<200m) via the geom column.
  if (input.latitude != null && input.longitude != null) {
    const { data } = await db.rpc("listings_within_distance", {
      lat: input.latitude,
      lng: input.longitude,
      meters: GPS_MATCH_DISTANCE_METERS,
    });
    if (Array.isArray(data) && data.length > 0) {
      return {
        is_duplicate_suspected: true,
        matched_listing_id: data[0].id,
        match_type: "gps_proximity",
        similarity_score: 0.7,
        evidence: `Existing listing within ${GPS_MATCH_DISTANCE_METERS}m: "${data[0].title}"`,
      };
    }
  }

  // 3. Description trigram similarity within the same district/taluka.
  if (input.description && input.description.length > 30 && input.district) {
    const { data } = await db.rpc("listings_text_similar", {
      query_text: input.description,
      query_district: input.district,
      query_taluka: input.taluka || null,
      threshold: TEXT_SIMILARITY_THRESHOLD,
    });
    if (Array.isArray(data) && data.length > 0) {
      const sim = Number(data[0].similarity) || 0;
      return {
        is_duplicate_suspected: true,
        matched_listing_id: data[0].id,
        match_type: "text_similarity",
        similarity_score: sim,
        evidence: `Description matches "${data[0].title}" (${(sim * 100).toFixed(0)}% similar)`,
      };
    }
  }

  return NONE;
}
