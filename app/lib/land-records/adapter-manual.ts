// Manual land-record adapter: records are entered by admins (no external API),
// so "fetching" is just reading what's in the land_records table.
import type { LandRecordAdapter, LandRecordRequest, LandRecordResult } from "@/app/lib/land-records/types";
import { getCachedRecord } from "@/app/lib/land-records/cache";

export class ManualAdapter implements LandRecordAdapter {
  state = "*";
  source = "manual" as const;

  isAvailable() {
    return true;
  }

  async fetch(req: LandRecordRequest): Promise<LandRecordResult> {
    const existing = await getCachedRecord(req);
    if (existing) return existing;
    throw new Error("NOT_FOUND");
  }

  costPerFetchInr() {
    return 0;
  }
}
