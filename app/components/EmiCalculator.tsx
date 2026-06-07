"use client";

import { useState } from "react";
import { formatINR } from "@/app/lib/format";

export default function EmiCalculator({ defaultAmount = 5000000 }: { defaultAmount?: number }) {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [rate, setRate] = useState("9");
  const [years, setYears] = useState("15");

  const P = Number(amount);
  const annual = Number(rate);
  const n = Number(years) * 12;
  const r = annual / 12 / 100;

  const emi = !isFinite(P) || P <= 0 || n <= 0 ? 0 : r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
  const total = emi * n;
  const interest = total - P;

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">Loan amount (₹)
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Interest rate (% p.a.)
          <input type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Tenure (years)
          <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(emi))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">per month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(interest))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">total interest</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(total))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">total payable</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        An estimate for planning only. Actual loan terms, eligibility, and rates vary by lender — many banks treat
        agricultural land loans differently from home loans.
      </p>
    </div>
  );
}
