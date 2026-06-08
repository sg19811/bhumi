"use client";

import { useState } from "react";
import { formatINR } from "@/app/lib/format";

// Immovable property is "long-term" when held for more than 24 months. Post
// 23 Jul 2024, long-term capital gains on property are taxed at 12.5% without
// indexation (property bought earlier may opt for 20% with indexation — that
// comparison needs a CA). Short-term gains are added to income and taxed at slab.
const LTCG_RATE = 12.5;

export default function CapitalGainsCalculator() {
  const [buyPrice, setBuyPrice] = useState("3000000");
  const [buyYear, setBuyYear] = useState("2018");
  const [sellPrice, setSellPrice] = useState("5500000");
  const [sellYear, setSellYear] = useState("2026");

  const buy = Number(buyPrice);
  const sell = Number(sellPrice);
  const by = Math.floor(Number(buyYear));
  const sy = Math.floor(Number(sellYear));
  const valid = isFinite(buy) && buy > 0 && isFinite(sell) && sell > 0 && isFinite(by) && isFinite(sy) && sy >= by;

  const holding = valid ? sy - by : 0;
  const longTerm = holding >= 2;
  const gain = valid ? sell - buy : 0;
  const isLoss = gain < 0;
  const ltcgTax = valid && longTerm && gain > 0 ? (gain * LTCG_RATE) / 100 : 0;

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Purchase price (₹)
          <input type="number" min="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Year of purchase
          <input type="number" value={buyYear} onChange={(e) => setBuyYear(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Sale price (₹)
          <input type="number" min="0" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Year of sale
          <input type="number" value={sellYear} onChange={(e) => setSellYear(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className={`text-2xl font-bold ${isLoss ? "text-red-600" : "text-green-800"}`}>{formatINR(Math.round(gain))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{isLoss ? "capital loss" : "capital gain"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{holding} yr{holding === 1 ? "" : "s"}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{longTerm ? "long-term" : "short-term"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          {longTerm ? (
            <>
              <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(ltcgTax))}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">est. LTCG tax ({LTCG_RATE}%)</p>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-green-800">At your income slab</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">short-term — taxed as income</p>
            </>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {longTerm
          ? `Long-term (held over 24 months): estimated at ${LTCG_RATE}% without indexation. If you bought before 23 Jul 2024 you may instead opt for 20% with indexation — a CA can tell you which is lower.`
          : "Short-term (held 24 months or less): the gain is added to your taxable income and taxed at your slab rate, so the exact tax depends on your other income."}
        {" "}This ignores exemptions (e.g. Sections 54B/54F, rural-agricultural-land exemptions), improvement costs, and transfer expenses. It is a rough estimate, <strong>not tax advice</strong> — consult a chartered accountant.
      </p>
    </div>
  );
}
