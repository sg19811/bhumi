// Maps a state to its land-record adapter. Only ManualAdapter is registered for
// now; per-state external adapters (e.g. Landeed) get added here after a real
// integration. The manual adapter (state = "*") is the universal fallback.
import type { LandRecordAdapter } from "@/app/lib/land-records/types";
import { ManualAdapter } from "@/app/lib/land-records/adapter-manual";

const manual = new ManualAdapter();

// state code → adapter. Add entries like `tamil_nadu: new TamilNilamAdapter()` later.
const REGISTRY: Record<string, LandRecordAdapter> = {};

export function getAdapter(_state: string): LandRecordAdapter {
  return REGISTRY[_state] ?? manual;
}
