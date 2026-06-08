"use client";

import { useState } from "react";
import type { MaintenancePeriod, PlotSizeUnit } from "@/app/lib/farm-plots/types";

// Total Cost of Ownership for a farm plot. Sticker price hides registration,
// years of maintenance, and one-time development charges — this surfaces the
// real all-in number. Everything is an editable estimate; nothing is claimed as
// official. All listing fields are read defensively (the migration is additive).

type Props = {
  plotPrice?: number | null;          // listings.price (integer rupees)
  maintenanceFeeAmount?: number | null;
  maintenanceFeePeriod?: MaintenancePeriod | null;
  plotSizeValue?: number | null;       // for the per-unit line (optional)
  plotSizeUnit?: PlotSizeUnit | null;
};

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// How many times a fee is charged per year.
const PERIOD_PER_YEAR: Record<MaintenancePeriod, number> = {
  monthly: 12,
  quarterly: 4,
  yearly: 1,
  one_time: 0, // handled separately — charged once, not annually
};

const UNIT_LABEL: Record<PlotSizeUnit, string> = {
  sqft: "sq ft",
  guntha: "guntha",
  cent: "cent",
  acre: "acre",
};

export default function TotalCostCalculator({
  plotPrice,
  maintenanceFeeAmount,
  maintenanceFeePeriod,
  plotSizeValue,
  plotSizeUnit,
}: Props) {
  const [price, setPrice] = useState<string>(plotPrice ? String(plotPrice) : "");
  const [stampPct, setStampPct] = useState<string>("6.5");
  const [maint, setMaint] = useState<string>(maintenanceFeeAmount ? String(maintenanceFeeAmount) : "");
  const [years, setYears] = useState<string>("5");
  const [devCharges, setDevCharges] = useState<string>("");

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const base = num(price);
  const stamp = (base * num(stampPct)) / 100;
  const period = maintenanceFeePeriod ?? "yearly";
  const yrs = num(years);
  // One-time maintenance/club fee is charged once; recurring fees scale with years.
  const maintTotal =
    period === "one_time" ? num(maint) : num(maint) * PERIOD_PER_YEAR[period] * yrs;
  const dev = num(devCharges);
  const total = base + stamp + maintTotal + dev;

  const perUnit =
    plotSizeValue && plotSizeValue > 0 && plotSizeUnit && total > 0
      ? total / plotSizeValue
      : null;

  const rows: { label: string; value: number; hint?: string }[] = [
    { label: "Plot price", value: base },
    { label: `Stamp duty & registration (${num(stampPct)}%)`, value: stamp, hint: "estimate — confirm with the sub-registrar" },
    {
      label:
        period === "one_time"
          ? "Maintenance / club fee (one-time)"
          : `Maintenance (${maintenanceFeePeriod ?? "yearly"} × ${yrs} yr${yrs === 1 ? "" : "s"})`,
      value: maintTotal,
    },
    { label: "Development / amenity charges", value: dev },
  ];

  return (
    <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-900">Total cost of ownership</h2>
      <p className="mt-1 text-sm text-stone-500">
        The real all-in cost, not just the plot price. Adjust any figure to match your quote — all values
        are estimates.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-stone-700">Plot price (₹)</span>
          <input
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 2500000"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-stone-700">Stamp duty & registration (%)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={stampPct}
            onChange={(e) => setStampPct(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-stone-700">
            Maintenance fee (₹{maintenanceFeePeriod ? `, ${maintenanceFeePeriod}` : ""})
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={maint}
            onChange={(e) => setMaint(e.target.value)}
            placeholder="e.g. 12000"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </label>

        {period !== "one_time" && (
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Hold period (years)</span>
            <input
              type="number"
              inputMode="numeric"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </label>
        )}

        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-stone-700">Development / amenity charges (₹, optional)</span>
          <input
            type="number"
            inputMode="numeric"
            value={devCharges}
            onChange={(e) => setDevCharges(e.target.value)}
            placeholder="e.g. 150000"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </label>
      </div>

      <div className="mt-5 divide-y divide-stone-100 rounded-xl bg-stone-50 px-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-stone-600">
              {r.label}
              {r.hint && <span className="ml-1 text-xs text-stone-400">({r.hint})</span>}
            </span>
            <span className="font-medium text-stone-800">{inr(r.value)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-3">
          <span className="font-semibold text-stone-900">All-in cost</span>
          <span className="text-lg font-bold text-green-700">{inr(total)}</span>
        </div>
        {perUnit && (
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-stone-600">Effective cost per {UNIT_LABEL[plotSizeUnit!]}</span>
            <span className="font-medium text-stone-800">{inr(perUnit)}</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-stone-400">
        Estimates only. Stamp duty, registration, and maintenance vary by state, plot, and developer —
        confirm exact figures with the developer, the sub-registrar, and your lawyer before deciding.
      </p>
    </section>
  );
}
