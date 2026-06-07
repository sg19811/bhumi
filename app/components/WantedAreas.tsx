"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Seller-facing nudge: districts buyers are actively looking for but under-served.
// Fed by /api/wanted-areas (server-computed from demand signals). Renders nothing
// when there's no clear signal yet.
export default function WantedAreas({ variant = "card" }: { variant?: "card" | "inline" }) {
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    let on = true;
    fetch("/api/wanted-areas")
      .then((r) => (r.ok ? r.json() : { areas: [] }))
      .then((d) => { if (on) setAreas(d.areas ?? []); })
      .catch(() => {});
    return () => { on = false; };
  }, []);

  if (areas.length === 0) return null;

  return (
    <div className={variant === "card" ? "rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5" : "rounded-xl border border-amber-200 bg-amber-50/60 p-3.5"}>
      <p className="text-sm font-semibold text-amber-900">🔥 Buyers are looking for land here</p>
      <p className="mt-0.5 text-xs text-amber-800">Own land in these areas? It&apos;s in demand right now — list it.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {areas.map((a) => (
          <Link key={a} href={`/listing/new`} className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 transition-colors hover:border-amber-500">
            {a} →
          </Link>
        ))}
      </div>
    </div>
  );
}
