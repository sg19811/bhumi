"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function RequirementFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const set = useCallback(
    (k: string, v: string) => {
      const sp = new URLSearchParams(params.toString());
      if (v) sp.set(k, v);
      else sp.delete(k);
      router.push(`/requirements?${sp.toString()}`);
    },
    [params, router]
  );

  const sel = "shrink-0 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-green-600 focus:border-green-600";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2.5">
      <input
        defaultValue={params.get("district") ?? ""}
        onKeyDown={(e) => { if (e.key === "Enter") set("district", (e.target as HTMLInputElement).value.trim()); }}
        placeholder="District… (press Enter)"
        className={sel}
        aria-label="Filter by district"
      />
      <select defaultValue={params.get("land_type") ?? ""} onChange={(e) => set("land_type", e.target.value)} className={sel} aria-label="Filter by land type">
        <option value="">All land types</option>
        <option value="agri_land">Agricultural</option><option value="irrigated_farmland">Irrigated farmland</option>
        <option value="orchard">Orchard</option><option value="farmhouse_land">Farmhouse land</option>
        <option value="na_converted">NA-converted</option><option value="plantation">Plantation</option>
      </select>
      <select defaultValue={params.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value)} className={sel} aria-label="Sort requirements">
        <option value="">Newest</option><option value="budget">Highest budget</option>
      </select>
      {params.toString() && <button onClick={() => router.push("/requirements")} className="shrink-0 px-2 text-sm font-medium text-red-600 hover:underline">Clear</button>}
    </div>
  );
}
