"use client";

import type { PlotSizeUnit, PlotStatus } from "@/app/lib/farm-plots/types";

// Draft plot row (string-typed for form inputs). Converted to numbers on submit.
export type DraftPlot = { plot_label: string; size_value: string; size_unit: PlotSizeUnit; price: string; status: PlotStatus };

export const emptyPlot = (): DraftPlot => ({ plot_label: "", size_value: "", size_unit: "sqft", price: "", status: "available" });

const SIZE_UNITS: PlotSizeUnit[] = ["sqft", "guntha", "cent", "acre"];
const STATUSES: PlotStatus[] = ["available", "sold", "reserved", "on_hold"];

const fld = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

export default function PlotInventoryEditor({ value, onChange }: { value: DraftPlot[]; onChange: (v: DraftPlot[]) => void }) {
  const update = (i: number, patch: Partial<DraftPlot>) => onChange(value.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const add = () => onChange([...value, emptyPlot()]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Plot inventory <span className="font-normal text-gray-400">(optional — you can add this later via edit)</span></h3>
        <button type="button" onClick={add} className="rounded-full border border-green-700 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-50">+ Add plot</button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-400">No plots added. Skip for now or add individual plots with sizes and prices.</p>
      ) : (
        <div className="space-y-2">
          {value.map((p, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-2.5 sm:grid-cols-12">
              <input aria-label="Plot label" value={p.plot_label} onChange={(e) => update(i, { plot_label: e.target.value })} placeholder="Plot A-12" className={`${fld} sm:col-span-3`} />
              <input aria-label="Size" type="number" min="0" value={p.size_value} onChange={(e) => update(i, { size_value: e.target.value })} placeholder="Size" className={`${fld} sm:col-span-2`} />
              <select aria-label="Size unit" value={p.size_unit} onChange={(e) => update(i, { size_unit: e.target.value as PlotSizeUnit })} className={`${fld} sm:col-span-2`}>
                {SIZE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input aria-label="Price" type="number" min="0" value={p.price} onChange={(e) => update(i, { price: e.target.value })} placeholder="Price ₹" className={`${fld} sm:col-span-2`} />
              <select aria-label="Status" value={p.status} onChange={(e) => update(i, { status: e.target.value as PlotStatus })} className={`${fld} sm:col-span-2`}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <button type="button" onClick={() => remove(i)} aria-label="Remove plot" className="text-sm text-gray-400 hover:text-red-600 sm:col-span-1">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
