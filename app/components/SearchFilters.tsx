"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useLang } from "@/app/lib/i18n-client";

export default function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLang();
  const set = useCallback((k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    v ? sp.set(k, v) : sp.delete(k);
    router.push(`/explore?${sp.toString()}`);
  }, [params, router]);

  const sel = "shrink-0 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-green-600 focus:border-green-600";
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto border-b border-gray-200 bg-gray-50 px-5 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <select defaultValue={params.get("land_type") ?? ""} onChange={(e) => set("land_type", e.target.value)} className={sel}>
        <option value="">{t("f.allTypes")}</option>
        <option value="agri_land">{t("f.t.agri")}</option><option value="irrigated_farmland">{t("f.t.irrigated")}</option>
        <option value="orchard">{t("f.t.orchard")}</option><option value="farmhouse_land">{t("f.t.farmhouse")}</option>
        <option value="na_converted">{t("f.t.na")}</option><option value="plantation">{t("f.t.plantation")}</option><option value="dryland">{t("f.t.dryland")}</option>
        <optgroup label="Farm plot projects">
          <option value="farm_plot_project">Farm plot project</option>
          <option value="managed_farmland">Managed farmland</option>
          <option value="farmhouse_plot">Farmhouse plot</option>
          <option value="gated_farm_plot">Gated farm plot</option>
          <option value="plantation_project">Plantation project</option>
        </optgroup>
      </select>
      <select defaultValue={params.get("min_price") ?? ""} onChange={(e) => set("min_price", e.target.value)} className={sel} aria-label="Minimum price">
        <option value="">{t("f.anyMin")}</option><option value="1000000">₹10L+</option><option value="2500000">₹25L+</option>
        <option value="5000000">₹50L+</option><option value="10000000">₹1Cr+</option>
      </select>
      <select defaultValue={params.get("max_price") ?? ""} onChange={(e) => set("max_price", e.target.value)} className={sel} aria-label="Maximum price">
        <option value="">{t("f.anyMax")}</option><option value="2500000">{t("f.under25")}</option><option value="5000000">{t("f.under50")}</option>
        <option value="10000000">{t("f.under100")}</option><option value="25000000">{t("f.under250")}</option>
      </select>
      <select defaultValue={params.get("max_area") ?? ""} onChange={(e) => set("max_area", e.target.value)} className={sel}>
        <option value="">{t("f.anySize")}</option><option value="1">{t("f.acre1")}</option><option value="2">{t("f.acre2")}</option>
        <option value="5">{t("f.acre5")}</option><option value="10">{t("f.acre10")}</option><option value="25">{t("f.acre25")}</option>
      </select>
      <select defaultValue={params.get("water_source") ?? ""} onChange={(e) => set("water_source", e.target.value)} className={sel}>
        <option value="">{t("f.anyWater")}</option><option value="borewell">{t("f.w.borewell")}</option><option value="canal">{t("f.w.canal")}</option>
        <option value="river">{t("f.w.river")}</option><option value="rainfed">{t("f.w.rainfed")}</option>
      </select>
      <select defaultValue={params.get("road_access") ?? ""} onChange={(e) => set("road_access", e.target.value)} className={sel}>
        <option value="">{t("f.anyRoad")}</option><option value="highway">{t("f.r.highway")}</option><option value="paved">{t("f.r.paved")}</option><option value="dirt">{t("f.r.dirt")}</option>
      </select>
      <select defaultValue={params.get("verified") ?? ""} onChange={(e) => set("verified", e.target.value)} className={sel}>
        <option value="">{t("f.all")}</option><option value="true">{t("f.verifiedOnly")}</option>
      </select>
      <select defaultValue={params.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value)} className={sel} aria-label="Sort listings">
        <option value="">{t("f.newest")}</option><option value="price_asc">{t("f.priceAsc")}</option>
        <option value="price_desc">{t("f.priceDesc")}</option><option value="area_desc">{t("f.areaDesc")}</option>
      </select>
      {params.toString() && <button onClick={() => router.push("/explore")} className="shrink-0 px-2 text-sm font-medium text-red-600 hover:underline">{t("filters.clear")}</button>}
    </div>
  );
}
