"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSavedSearches } from "@/app/lib/saved-searches";
import { formatINRShort } from "@/app/lib/format";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function buildLabel(map: Record<string, string>): string {
  const parts: string[] = [];
  if (map.q) parts.push(`“${map.q}”`);
  if (map.land_type) parts.push(cap(map.land_type.replace(/_/g, " ")));
  if (map.min_price) parts.push(`≥ ${formatINRShort(map.min_price)}`);
  if (map.max_price) parts.push(`≤ ${formatINRShort(map.max_price)}`);
  if (map.max_area) parts.push(`≤ ${map.max_area} acre${Number(map.max_area) > 1 ? "s" : ""}`);
  if (map.water_source) parts.push(cap(map.water_source));
  if (map.road_access) parts.push(`${cap(map.road_access)} road`);
  if (map.verified === "true") parts.push("Verified");
  return parts.join(" · ") || "All listings";
}

export default function SavedSearches() {
  const params = useSearchParams();
  const { searches, save, remove, has } = useSavedSearches();

  // Filters only (ignore sort) and sorted for a stable identity.
  const filterEntries = [...params.entries()].filter(([k, v]) => v && k !== "sort");
  const sorted = filterEntries.slice().sort((a, b) => a[0].localeCompare(b[0]));
  const query = new URLSearchParams(sorted).toString();
  const map = Object.fromEntries(filterEntries);
  const hasFilters = filterEntries.length > 0;
  const saved = has(query);

  if (!hasFilters && searches.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {hasFilters &&
        (saved ? (
          <button
            onClick={() => remove(query)}
            className="inline-flex items-center gap-1.5 rounded-full border border-green-600 bg-green-50 px-3.5 py-1.5 text-sm font-medium text-green-800"
          >
            ★ Saved
          </button>
        ) : (
          <button
            onClick={() => save({ id: query, label: buildLabel(map), query })}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
          >
            ☆ Save this search
          </button>
        ))}

      {searches.length > 0 && <span className="h-5 w-px bg-gray-200" />}

      {searches.map((s) => (
        <span
          key={s.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1.5 pl-3.5 pr-2 text-sm text-gray-700"
        >
          <Link href={`/explore?${s.query}`} className="hover:text-green-800">
            {s.label}
          </Link>
          <button
            onClick={() => remove(s.id)}
            aria-label={`Remove saved search: ${s.label}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-red-600"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}
