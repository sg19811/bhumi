"use client";

import { useState } from "react";

// Square metres per unit (exact standard conversions). Bigha is excluded
// because it varies by region.
const SQM: Record<string, number> = {
  acre: 4046.8564224,
  guntha: 101.17141056,
  hectare: 10000,
  sqft: 0.09290304,
  cent: 40.468564224,
};

const UNITS: { key: string; label: string }[] = [
  { key: "acre", label: "Acres" },
  { key: "guntha", label: "Gunthas" },
  { key: "hectare", label: "Hectares" },
  { key: "cent", label: "Cents" },
  { key: "sqft", label: "Square feet" },
];

function fmt(n: number) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 4 });
}

export default function AreaConverter() {
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState("acre");

  const v = Number(value);
  const sqm = isFinite(v) ? v * SQM[unit] : NaN;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="0"
          step="any"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15 sm:flex-1"
          aria-label="Area value"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600"
          aria-label="From unit"
        >
          {UNITS.map((u) => (
            <option key={u.key} value={u.key}>{u.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {UNITS.filter((u) => u.key !== unit).map((u) => (
          <div key={u.key} className="rounded-xl border border-gray-200 bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-800">{fmt(sqm / SQM[u.key])}</p>
            <p className="text-sm text-gray-500">{u.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-gray-400">
        Standard conversions. <span className="font-medium">Bigha</span> is intentionally omitted — it varies by
        region and state, so always confirm the local definition before relying on it.
      </p>
    </div>
  );
}
