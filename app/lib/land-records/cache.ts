// Land-record caching against the land_records table. Server-only.
import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import type { LandRecordRequest, LandRecordResult } from "@/app/lib/land-records/types";

// Map a land_records DB row → the camelCase LandRecordResult shape.
export function rowToResult(r: Record<string, unknown>): LandRecordResult {
  return {
    id: r.id as string,
    source: r.source as LandRecordResult["source"],
    retrievedAt: r.retrieved_at as string,
    owners: Array.isArray(r.owners) ? (r.owners as LandRecordResult["owners"]) : [],
    extent: { value: Number(r.extent_value) || 0, unit: (r.extent_unit as LandRecordResult["extent"]["unit"]) ?? "acres" },
    classification: (r.classification as string) ?? null,
    fmbSketchUrl: (r.fmb_sketch_url as string) ?? null,
    parentDocument: (r.parent_document as string) ?? null,
    encumbranceStatus: (r.encumbrance_status as LandRecordResult["encumbranceStatus"]) ?? null,
    rawPayload: (r.raw_payload as object) ?? {},
    fetchCostInr: Number(r.fetch_cost_inr) || 0,
  };
}

// Returns a cached record if it exists and hasn't expired, else null.
export async function getCachedRecord(req: LandRecordRequest): Promise<LandRecordResult | null> {
  let q = db
    .from("land_records")
    .select("*")
    .eq("state", req.state)
    .eq("district", req.district)
    .eq("taluka", req.taluka)
    .eq("village", req.village)
    .eq("survey_number", req.surveyNumber);
  q = req.subDivision ? q.eq("sub_division", req.subDivision) : q.is("sub_division", null);
  const { data } = await q.limit(1).maybeSingle();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
  return rowToResult(data);
}

// Insert or refresh a cached record (used by external adapters). Returns the stored result.
export async function setCachedRecord(result: LandRecordResult, req: LandRecordRequest, ttlDays = 90): Promise<LandRecordResult> {
  const now = new Date();
  const expires = new Date(now.getTime() + ttlDays * 86400000);
  const payload = {
    state: req.state, district: req.district, taluka: req.taluka, village: req.village,
    survey_number: req.surveyNumber, sub_division: req.subDivision ?? null,
    source: result.source, retrieved_at: now.toISOString(), expires_at: expires.toISOString(),
    owners: result.owners, extent_value: result.extent.value, extent_unit: result.extent.unit,
    classification: result.classification, fmb_sketch_url: result.fmbSketchUrl,
    parent_document: result.parentDocument, encumbrance_status: result.encumbranceStatus,
    raw_payload: result.rawPayload, fetch_cost_inr: result.fetchCostInr,
  };

  // Expression unique index (coalesce(sub_division,'')) rules out a clean upsert,
  // so update-if-exists, else insert.
  let lookup = db
    .from("land_records")
    .select("id")
    .eq("state", req.state)
    .eq("district", req.district)
    .eq("taluka", req.taluka)
    .eq("village", req.village)
    .eq("survey_number", req.surveyNumber);
  lookup = req.subDivision ? lookup.eq("sub_division", req.subDivision) : lookup.is("sub_division", null);
  const { data: existing } = await lookup.limit(1).maybeSingle();
  if (existing?.id) {
    const { data } = await db.from("land_records").update(payload).eq("id", existing.id).select("*").maybeSingle();
    return data ? rowToResult(data) : result;
  }
  const { data } = await db.from("land_records").insert(payload).select("*").maybeSingle();
  return data ? rowToResult(data) : result;
}
