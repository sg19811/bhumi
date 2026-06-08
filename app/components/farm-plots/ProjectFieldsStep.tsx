"use client";

import { useState } from "react";
import { AMENITIES } from "@/app/lib/farm-plots/amenities";
import { getCorridorsByCity } from "@/app/lib/farm-plots/corridors";
import { CITIES } from "@/app/lib/farm-plots/cities";

const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

// Conditional project fields. Mostly uncontrolled (name= read via FormData on submit);
// city + corridor are controlled so the corridor list filters to the chosen city.
// `d` is the existing listing for edit prefill; undefined for create.
export default function ProjectFieldsStep({ d }: { d?: Record<string, unknown> }) {
  const v = (k: string) => (d?.[k] ?? "") as string | number;
  const selectedAmenities: string[] = Array.isArray(d?.amenities) ? (d!.amenities as string[]) : [];

  const [city, setCity] = useState<string>((d?.nearest_city as string) || "bangalore");
  const [corridor, setCorridor] = useState<string>((d?.corridor as string) || "");
  const cityCorridors = getCorridorsByCity(city);

  const onCityChange = (next: string) => {
    setCity(next);
    // Reset corridor if it no longer belongs to the newly-chosen city.
    if (!getCorridorsByCity(next).some((c) => c.slug === corridor)) setCorridor("");
  };

  return (
    <section className="space-y-4 rounded-2xl border border-green-200 bg-green-50/40 p-5">
      <h2 className="text-lg font-semibold text-green-800">Project details</h2>
      <p className="-mt-2 text-sm text-gray-500">These appear because you chose a farm-plot project type.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="block text-sm font-medium mb-1">Project name</label>
          <input name="project_name" defaultValue={v("project_name")} placeholder="Green Acres Phase 1" className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Developer name</label>
          <input name="developer_name" defaultValue={v("developer_name")} placeholder="Developer / company" className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Project stage</label>
          <select name="project_stage" defaultValue={v("project_stage")} className={inp}>
            <option value="">Select</option><option value="pre_launch">Pre-launch</option><option value="launched">Launched</option><option value="partial_inventory">Partial inventory</option><option value="completed">Completed</option>
          </select></div>
        <div><label className="block text-sm font-medium mb-1">City</label>
          <select name="nearest_city" value={city} onChange={(e) => onCityChange(e.target.value)} className={inp}>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}{c.status === "coming_soon" ? " (expanding)" : ""}</option>
            ))}
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Corridor</label>
          <select name="corridor" value={corridor} onChange={(e) => setCorridor(e.target.value)} className={inp} disabled={cityCorridors.length === 0}>
            <option value="">{cityCorridors.length ? "Select corridor" : "No corridors yet — leave blank"}</option>
            {cityCorridors.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          {cityCorridors.length === 0 && <p className="mt-1 text-xs text-gray-400">We&apos;ll add corridors for {city.replace(/-/g, " ")} as projects come in.</p>}
        </div>
        <div><label className="block text-sm font-medium mb-1">Distance from city (km)</label>
          <input name="distance_from_city_km" type="number" min="0" step="0.1" defaultValue={v("distance_from_city_km")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Travel time (minutes)</label>
          <input name="travel_time_minutes" type="number" min="0" defaultValue={v("travel_time_minutes")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Total project acres</label>
          <input name="total_project_acres" type="number" min="0" step="0.01" defaultValue={v("total_project_acres")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Number of plots</label>
          <input name="plot_count" type="number" min="0" defaultValue={v("plot_count")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Plot size — min</label>
          <input name="plot_size_min_value" type="number" min="0" defaultValue={v("plot_size_min_value")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Plot size — max</label>
          <input name="plot_size_max_value" type="number" min="0" defaultValue={v("plot_size_max_value")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Plot size unit</label>
          <select name="plot_size_unit" defaultValue={v("plot_size_unit") || "sqft"} className={inp}>
            <option value="sqft">sq ft</option><option value="guntha">guntha</option><option value="cent">cent</option><option value="acre">acre</option>
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Possession timeline</label>
          <select name="possession_timeline" defaultValue={v("possession_timeline")} className={inp}>
            <option value="">Select</option><option value="ready">Ready</option><option value="6_months">6 months</option><option value="12_months">12 months</option><option value="24_months">24 months</option><option value="phased">Phased</option>
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Maintenance fee (₹)</label>
          <input name="maintenance_fee_amount" type="number" min="0" defaultValue={v("maintenance_fee_amount")} className={inp} /></div>
        <div><label className="block text-sm font-medium mb-1">Maintenance period</label>
          <select name="maintenance_fee_period" defaultValue={v("maintenance_fee_period")} className={inp}>
            <option value="">Select</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option><option value="one_time">One-time</option>
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Layout approval</label>
          <select name="layout_approval_status" defaultValue={v("layout_approval_status")} className={inp}>
            <option value="">Select</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="not_required">Not required</option><option value="unknown">Unknown</option>
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Conversion status</label>
          <select name="conversion_status" defaultValue={v("conversion_status")} className={inp}>
            <option value="">Select</option><option value="converted">Converted (NA)</option><option value="agricultural">Agricultural</option><option value="partial">Partial</option><option value="unknown">Unknown</option>
          </select></div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amenities</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((a) => (
            <label key={a.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="amenities" value={a.key} defaultChecked={selectedAmenities.includes(a.key)} className="h-4 w-4 accent-green-700" />
              <span>{a.emoji} {a.label}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
