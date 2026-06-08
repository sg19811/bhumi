"use client";

import { useState } from "react";
import { formatINR } from "@/app/lib/format";

// FOIR = share of income a lender lets go to all EMIs (typically 40–55%).
// LTV for raw/agri land loans is conservative — we assume the loan funds ~70%
// of the property, so the indicative budget grosses the eligible loan up by that.
const FOIR = 0.5;
const LTV = 0.7;

export default function LoanEligibilityCalculator() {
  const [income, setIncome] = useState("100000");
  const [emis, setEmis] = useState("0");
  const [rate, setRate] = useState("9.5");
  const [years, setYears] = useState("15");

  const I = Number(income);
  const E = Number(emis);
  const annualRate = Number(rate);
  const N = Math.max(0, Math.floor(Number(years))) * 12;
  const valid = isFinite(I) && I > 0 && isFinite(annualRate) && annualRate >= 0 && N >= 1;

  const maxEmi = valid ? Math.max(0, I * FOIR - (isFinite(E) ? E : 0)) : 0;
  const r = annualRate / 100 / 12;
  // Present value of an annuity: loan a max EMI can service over N months.
  const eligibleLoan = valid && maxEmi > 0
    ? (r > 0 ? (maxEmi * (Math.pow(1 + r, N) - 1)) / (r * Math.pow(1 + r, N)) : maxEmi * N)
    : 0;
  const budget = eligibleLoan > 0 ? eligibleLoan / LTV : 0;

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Net monthly income (₹)
          <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Existing monthly EMIs (₹)
          <input type="number" min="0" value={emis} onChange={(e) => setEmis(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Interest rate (% p.a.)
          <input type="number" step="0.1" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Tenure (years)
          <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(maxEmi))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">max affordable EMI</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(eligibleLoan))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">eligible loan</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(budget))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">indicative property budget</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Assumes lenders allow about {FOIR * 100}% of income toward all EMIs, and that an agricultural-land loan
        funds roughly {LTV * 100}% of the property (you arrange the rest as down payment). Real eligibility depends
        on credit score, income proof, the property&apos;s legal status, and each lender&apos;s policy — treat this as a
        starting estimate, not an approval. Note: many banks lend cautiously on raw agricultural land.
      </p>
    </div>
  );
}
