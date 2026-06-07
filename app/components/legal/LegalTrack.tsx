"use client";

import { useEffect } from "react";
import { track, type LegalEvent } from "@/app/lib/legal/analytics";

// Fires a single analytics event on mount. Drop into any server page.
export default function LegalTrack({ event, props }: { event: LegalEvent; props?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, props ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
