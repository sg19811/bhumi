"use client";

import { useState } from "react";
import { formatINRShort, pricePerAcre } from "@/app/lib/format";

const UNITS = [
  { value: "acre", label: "acres" },
  { value: "guntha", label: "gunthas" },
  { value: "hectare", label: "hectares" },
  { value: "cent", label: "cents" },
  { value: "sqft", label: "sq ft" },
];

// Convert a normalized ₹/acre into every other common unit, so two plots quoted
// in different units (₹/guntha vs total price for acres) can be compared fairly.
function perUnitFrom(ppa: number) {
  return [
    { label: "per acre", value: ppa },
    { label: "per guntha", value: ppa / 40 },
    { label: "per cent", value: ppa / 100 },
    { label: "per hectare", value: ppa * 2.47105 },
    { label: "per sq ft", value: ppa / 43560 },
  ];
}

export default function PricePerUnitCalculator({ defaultPrice = 4500000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(String(defaultPrice));
  const [area, setArea] = useState("2.5");
  const [unit, setUnit] = useState("acre");

  const P = Number(price);
  const A = Number(area);
  const valid = isFinite(P) && P > 0 && isFinite(A) && A > 0;
  const ppa = valid ? pricePerAcre({ price: P, price_basis: "total", area_value: A, area_unit: unit }) : null;
  const rows = ppa ? perUnitFrom(ppa) : [];

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">Total price (₹)
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Area
          <input type="number" step="any" min="0" value={area} onChange={(e) => setArea(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Unit
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className={`mt-1 ${field}`}>
            {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </label>
      </div>

      {rows.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
              <p className="text-lg font-bold text-green-800">{formatINRShort(Math.round(r.value))}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{r.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-400">Enter a price and area to see the normalized rate per unit.</p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Normalizes a quoted price to every common unit so you can compare plots fairly. 1 acre = 40 gunthas =
        100 cents = 43,560 sq ft ≈ 0.405 hectares. Bigha is intentionally excluded because it varies by region.
      </p>
    </div>
  );
}
