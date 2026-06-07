"use client";

import { useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

// Counts a listing view at most once per 12h per browser (avoids refresh/bot inflation).
export default function TrackView({ id }: { id: string }) {
  useEffect(() => {
    try {
      const key = `view:${id}`;
      const last = Number(localStorage.getItem(key) || 0);
      if (Date.now() - last < 12 * 60 * 60 * 1000) return;
      localStorage.setItem(key, String(Date.now()));
      supabase.rpc("increment_listing_views", { lid: id }).then(() => {});
    } catch {
      /* ignore */
    }
  }, [id]);
  return null;
}
