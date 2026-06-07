"use client";

import { useEffect } from "react";

export const RECENTLY_VIEWED_KEY = "bhumi:recently-viewed";
const MAX = 12;

/** Records a listing id (most-recent first) in localStorage. Renders nothing. */
export default function TrackRecentlyViewed({ id }: { id: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [id, ...ids.filter((x) => x !== id)].slice(0, MAX);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [id]);
  return null;
}
