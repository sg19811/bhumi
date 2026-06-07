"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatINRShort } from "@/app/lib/format";
import { useLang } from "@/app/lib/i18n-client";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const sortLabels: Record<string, string> = {
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  area_desc: "Largest area",
};

export default function ActiveFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLang();
  const g = (k: string) => params.get(k) ?? "";

  const chips: { key: string; label: string }[] = [];
  if (g("q")) chips.push({ key: "q", label: `“${g("q")}”` });
  if (g("land_type")) chips.push({ key: "land_type", label: cap(g("land_type").replace(/_/g, " ")) });
  if (g("min_price")) chips.push({ key: "min_price", label: `≥ ${formatINRShort(g("min_price"))}` });
  if (g("max_price")) chips.push({ key: "max_price", label: `≤ ${formatINRShort(g("max_price"))}` });
  if (g("max_area")) chips.push({ key: "max_area", label: `≤ ${g("max_area")} acre${Number(g("max_area")) > 1 ? "s" : ""}` });
  if (g("water_source")) chips.push({ key: "water_source", label: cap(g("water_source")) });
  if (g("road_access")) chips.push({ key: "road_access", label: `${cap(g("road_access"))} road` });
  if (g("verified") === "true") chips.push({ key: "verified", label: "Verified only" });
  if (sortLabels[g("sort")]) chips.push({ key: "sort", label: sortLabels[g("sort")] });

  if (chips.length === 0) return null;

  const removeKey = (k: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.delete(k);
    router.push(sp.toString() ? `/explore?${sp.toString()}` : "/explore");
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">{t("filters.label")}</span>
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => removeKey(c.key)}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-50 py-1 pl-3 pr-2 text-sm text-green-800 transition-colors hover:bg-green-100"
          aria-label={`Remove filter: ${c.label}`}
        >
          {c.label}
          <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-green-700/10 text-[10px]">✕</span>
        </button>
      ))}
    </div>
  );
}
