"use client";

import { useRouter } from "next/navigation";
import { citiesByState } from "@/app/lib/farm-plots/cities";

// The location menu: pick any city and jump to its farm-plots page. Grouped by
// state. Coming-soon cities are selectable (they show a coming-soon page).
// This is what makes the section PAN-India rather than Bangalore-only.
export default function CitySelector({ current }: { current?: string }) {
  const router = useRouter();
  const groups = citiesByState();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="font-medium text-gray-600">📍 City</span>
      <select
        value={current ?? ""}
        onChange={(e) => {
          if (e.target.value) router.push(`/farm-plots/${e.target.value}`);
        }}
        className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        aria-label="Choose a city"
      >
        {!current && <option value="">Choose a city…</option>}
        {groups.map((g) => (
          <optgroup key={g.state} label={g.state}>
            {g.cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
                {c.status === "coming_soon" ? " — coming soon" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
