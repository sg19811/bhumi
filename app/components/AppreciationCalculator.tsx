"use client";

import { useState } from "react";
import { formatINR, formatINRShort } from "@/app/lib/format";

export default function AppreciationCalculator({ defaultPrice = 5000000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(String(defaultPrice));
  const [growth, setGrowth] = useState("8");
  const [years, setYears] = useState("10");

  const P = Number(price);
  const g = Number(growth) / 100;
  const N = Math.max(0, Math.floor(Number(years)));
  const valid = isFinite(P) && P > 0 && N >= 1;

  const projected = valid ? P * Math.pow(1 + g, N) : 0;
  const gain = projected - P;
  const gainPct = valid ? (gain / P) * 100 : 0;

  // Year-by-year schedule (cap rows shown).
  const rows = valid ? Array.from({ length: Math.min(N, 30) }, (_, i) => {
    const y = i + 1;
    return { y, value: P * Math.pow(1 + g, y) };
  }) : [];

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">Purchase price (₹)
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Annual growth (%)
          <input type="number" step="0.5" value={growth} onChange={(e) => setGrowth(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Years
          <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(projected))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">projected value</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(gain))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">total appreciation</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{Math.round(gainPct)}%</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">total growth</p>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-500"><th className="px-4 py-2 font-medium">Year</th><th className="px-4 py-2 font-medium">Projected value</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.y}><td className="px-4 py-2 text-gray-600">{r.y}</td><td className="px-4 py-2 font-medium text-gray-800">{formatINRShort(r.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Compound growth at a rate you choose — a planning estimate, not a forecast. We don&apos;t yet have
        verified per-district historical growth rates, so enter a conservative figure based on local knowledge.
      </p>
    </div>
  );
}
