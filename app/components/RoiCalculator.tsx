"use client";

import { useState } from "react";
import { formatINR } from "@/app/lib/format";

// Annualised IRR for a cashflow series via bisection (returns null if no sign change).
function irr(cashflows: number[]): number | null {
  const npv = (rate: number) => cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0);
  let lo = -0.9999;
  let hi = 10;
  let fLo = npv(lo);
  const fHi = npv(hi);
  if (!isFinite(fLo) || !isFinite(fHi) || fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const f = npv(mid);
    if (Math.abs(f) < 1e-6) return mid;
    if (fLo * f < 0) hi = mid;
    else { lo = mid; fLo = f; }
  }
  return (lo + hi) / 2;
}

export default function RoiCalculator({ defaultPrice = 5000000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(String(defaultPrice));
  const [years, setYears] = useState("5");
  const [growth, setGrowth] = useState("8");
  const [income, setIncome] = useState("0");

  const P = Number(price);
  const N = Math.max(0, Math.floor(Number(years)));
  const g = Number(growth) / 100;
  const inc = Number(income) || 0;

  const valid = isFinite(P) && P > 0 && N >= 1;
  const saleValue = valid ? P * Math.pow(1 + g, N) : 0;
  const capitalGain = saleValue - P;
  const totalIncome = inc * N;
  const totalReturn = capitalGain + totalIncome;
  const totalReturnPct = valid ? (totalReturn / P) * 100 : 0;

  let annualised: number | null = null;
  if (valid) {
    const cf = [-P];
    for (let t = 1; t < N; t++) cf.push(inc);
    cf.push(inc + saleValue);
    annualised = irr(cf);
  }

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Purchase price (₹)
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Holding period (years)
          <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Expected annual price growth (%)
          <input type="number" step="0.5" value={growth} onChange={(e) => setGrowth(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Yearly income — rent / farm (₹, optional)
          <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-xl font-bold text-green-800 sm:text-2xl">{formatINR(Math.round(saleValue))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">projected value</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-xl font-bold text-green-800 sm:text-2xl">{formatINR(Math.round(totalReturn))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">total return</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-xl font-bold text-green-800 sm:text-2xl">{Math.round(totalReturnPct)}%</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">total return</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-xl font-bold text-green-800 sm:text-2xl">{annualised == null ? "—" : `${(annualised * 100).toFixed(1)}%`}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">annualised (IRR)</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        A planning estimate only. Growth is an assumption you choose — land appreciation varies widely by
        location, access, and demand, and isn&apos;t guaranteed. Excludes stamp duty, registration, taxes, and upkeep.
      </p>
    </div>
  );
}
