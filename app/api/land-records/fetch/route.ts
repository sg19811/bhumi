import { getAdminUserId } from "@/app/lib/ai/require-user";
import { getCachedRecord, setCachedRecord } from "@/app/lib/land-records/cache";
import { getAdapter } from "@/app/lib/land-records/registry";
import type { LandRecordRequest } from "@/app/lib/land-records/types";

export const dynamic = "force-dynamic";

function fail(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(req: Request) {
  if (!(await getAdminUserId(req))) return fail("UNAUTHORIZED", "Admins only.", 401);

  let body: Partial<LandRecordRequest>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_REQUEST", "Invalid request.", 400);
  }

  const request: LandRecordRequest = {
    state: String(body.state ?? "").trim(),
    district: String(body.district ?? "").trim(),
    taluka: String(body.taluka ?? "").trim(),
    village: String(body.village ?? "").trim(),
    surveyNumber: String(body.surveyNumber ?? "").trim(),
    subDivision: body.subDivision ? String(body.subDivision).trim() : undefined,
  };
  if (!request.state || !request.district || !request.taluka || !request.village || !request.surveyNumber) {
    return fail("INVALID_REQUEST", "State, district, taluka, village and survey number are required.", 400);
  }

  // 1. Cache.
  const cached = await getCachedRecord(request);
  if (cached) return Response.json(cached);

  // 2. Adapter.
  const adapter = getAdapter(request.state);
  if (!adapter.isAvailable()) {
    return fail("NOT_FOUND", "No record on file. Add it manually.", 404);
  }
  try {
    const result = await adapter.fetch(request);
    const stored = await setCachedRecord(result, request);
    return Response.json(stored);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("NOT_FOUND")) return fail("NOT_FOUND", "No record on file. Add it manually.", 404);
    return fail("ADAPTER_ERROR", "Couldn't fetch the land record. Try again.", 502);
  }
}
