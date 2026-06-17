// Landeed adapter — STUB / placeholder.
//
// Replace these stubs once Landeed (or another land-record aggregator) provides
// API access:
//   1. Add LANDEED_API_KEY to .env.local + Vercel (server-only).
//   2. Implement fetch() to call their endpoint and map the response to
//      LandRecordResult.
//   3. Update isAvailable() to check `!!process.env.LANDEED_API_KEY`.
//   4. Register it in registry.ts (only after a real integration agreement).
//
// It is intentionally NOT registered yet — ManualAdapter remains the only
// active adapter.

import type { LandRecordAdapter, LandRecordRequest, LandRecordResult } from "@/app/lib/land-records/types";

export class LandeedAdapter implements LandRecordAdapter {
  state = "*";
  source = "landeed" as const;

  isAvailable() {
    return false; // not yet integrated
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(req: LandRecordRequest): Promise<LandRecordResult> {
    throw new Error("Not implemented — Landeed API not yet integrated");
  }

  costPerFetchInr() {
    return 100; // placeholder
  }
}
