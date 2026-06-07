"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ListingCard from "@/app/components/ListingCard";
import { RECENTLY_VIEWED_KEY } from "@/app/components/TrackRecentlyViewed";

/** Strip of recently viewed listings (from localStorage). Hidden when empty. */
export default function RecentlyViewed({ excludeId, limit = 4 }: { excludeId?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let ids: string[] = raw ? JSON.parse(raw) : [];
      if (excludeId) ids = ids.filter((x) => x !== excludeId);
      ids = ids.slice(0, limit);
      if (ids.length === 0) return;
      supabase
        .from("listings")
        .select("*")
        .in("id", ids)
        .eq("status", "active")
        .then(({ data }) => {
          const order = new Map(ids.map((id, i) => [id, i]));
          setItems((data ?? []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)));
        });
    } catch {
      /* ignore */
    }
  }, [excludeId, limit]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-4">
      <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Recently viewed</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
