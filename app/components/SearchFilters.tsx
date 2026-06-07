"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const set = useCallback((k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    v ? sp.set(k, v) : sp.delete(k);
    router.push(`/explore?${sp.toString()}`);
  }, [params, router]);

  const sel = "shrink-0 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-green-600 focus:border-green-600";
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto border-b border-gray-200 bg-gray-50 px-5 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <select defaultValue={params.get("land_type") ?? ""} onChange={(e) => set("land_type", e.target.value)} className={sel}>
        <option value="">All land types</option>
        <option value="agri_land">Agricultural</option><option value="irrigated_farmland">Irrigated farmland</option>
        <option value="orchard">Orchard</option><option value="farmhouse_land">Farmhouse land</option>
        <option value="na_converted">NA-converted</option><option value="plantation">Plantation</option><option value="dryland">Dryland</option>
      </select>
      <select defaultValue={params.get("min_price") ?? ""} onChange={(e) => set("min_price", e.target.value)} className={sel} aria-label="Minimum price">
        <option value="">Any min</option><option value="1000000">₹10L+</option><option value="2500000">₹25L+</option>
        <option value="5000000">₹50L+</option><option value="10000000">₹1Cr+</option>
      </select>
      <select defaultValue={params.get("max_price") ?? ""} onChange={(e) => set("max_price", e.target.value)} className={sel} aria-label="Maximum price">
        <option value="">Any max</option><option value="2500000">Under ₹25L</option><option value="5000000">Under ₹50L</option>
        <option value="10000000">Under ₹1Cr</option><option value="25000000">Under ₹2.5Cr</option>
      </select>
      <select defaultValue={params.get("max_area") ?? ""} onChange={(e) => set("max_area", e.target.value)} className={sel}>
        <option value="">Any size</option><option value="1">≤1 acre</option><option value="2">≤2 acres</option>
        <option value="5">≤5 acres</option><option value="10">≤10 acres</option><option value="25">≤25 acres</option>
      </select>
      <select defaultValue={params.get("water_source") ?? ""} onChange={(e) => set("water_source", e.target.value)} className={sel}>
        <option value="">Any water</option><option value="borewell">Borewell</option><option value="canal">Canal</option>
        <option value="river">River</option><option value="rainfed">Rainfed</option>
      </select>
      <select defaultValue={params.get("road_access") ?? ""} onChange={(e) => set("road_access", e.target.value)} className={sel}>
        <option value="">Any road</option><option value="highway">Highway</option><option value="paved">Paved</option><option value="dirt">Dirt road</option>
      </select>
      <select defaultValue={params.get("verified") ?? ""} onChange={(e) => set("verified", e.target.value)} className={sel}>
        <option value="">All</option><option value="true">Verified only</option>
      </select>
      <select defaultValue={params.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value)} className={sel} aria-label="Sort listings">
        <option value="">Newest</option><option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option><option value="area_desc">Largest area</option>
      </select>
      {params.toString() && <button onClick={() => router.push("/explore")} className="shrink-0 px-2 text-sm font-medium text-red-600 hover:underline">Clear</button>}
    </div>
  );
}
