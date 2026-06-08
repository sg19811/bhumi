"use client";

import { useState } from "react";
import { formatINR } from "@/app/lib/format";
import { STATES } from "@/app/lib/legal/options";

// Indicative registration-cost rates by state. These vary by property value,
// location (urban/rural), gender, and change with state budgets — NOT official.
// Always confirm with the sub-registrar's office before transacting.
type Rate = { stamp: number; reg: number; extra?: number; extraLabel?: string; regCap?: number; note: string };

const RATES: Record<string, Rate> = {
  karnataka: { stamp: 5.6, reg: 1, note: "≈5% stamp + cess/surcharge (urban). Lower slabs apply below ₹45 lakh." },
  maharashtra: { stamp: 6, reg: 1, regCap: 30000, note: "5% stamp + 1% metro cess in major cities; registration capped at ₹30,000." },
  tamil_nadu: { stamp: 7, reg: 4, note: "Among India's highest — 7% stamp + 4% registration." },
  andhra_pradesh: { stamp: 5, reg: 1, extra: 1.5, extraLabel: "Transfer duty", note: "5% stamp + 1.5% transfer duty + 1% registration." },
  kerala: { stamp: 8, reg: 2, note: "8% stamp + 2% registration, on the higher of price or fair value." },
};
const FALLBACK: Rate = { stamp: 6, reg: 1, note: "Generic estimate — rates vary widely by state. Confirm locally." };

export default function StampDutyCalculator({ defaultPrice = 5000000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(String(defaultPrice));
  const [state, setState] = useState("karnataka");

  const P = Number(price);
  const valid = isFinite(P) && P > 0;
  const r = RATES[state] ?? FALLBACK;

  const stamp = valid ? (P * r.stamp) / 100 : 0;
  const regRaw = valid ? (P * r.reg) / 100 : 0;
  const reg = r.regCap ? Math.min(regRaw, r.regCap) : regRaw;
  const extra = valid && r.extra ? (P * r.extra) / 100 : 0;
  const totalExtra = stamp + reg + extra;
  const grand = P + totalExtra;

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Property value (₹)
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">State
          <select value={state} onChange={(e) => setState(e.target.value)} className={`mt-1 ${field}`}>
            {STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-2 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Stamp duty ({r.stamp}%)</span><span className="font-medium text-gray-900">{formatINR(Math.round(stamp))}</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Registration ({r.reg}%{r.regCap ? `, max ${formatINR(r.regCap)}` : ""})</span><span className="font-medium text-gray-900">{formatINR(Math.round(reg))}</span></div>
        {r.extra ? <div className="flex items-center justify-between text-sm"><span className="text-gray-600">{r.extraLabel} ({r.extra}%)</span><span className="font-medium text-gray-900">{formatINR(Math.round(extra))}</span></div> : null}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-sm font-semibold"><span className="text-gray-700">Total registration cost</span><span className="text-green-800">{formatINR(Math.round(totalExtra))}</span></div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(totalExtra))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">extra over price ({valid ? Math.round((totalExtra / P) * 100) : 0}%)</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{formatINR(Math.round(grand))}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">grand total to register</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {r.note} These figures are <strong>indicative only</strong> — stamp duty and registration rates vary by
        property value, location, and buyer category, and change with state budgets. Confirm the exact amount with
        your sub-registrar&apos;s office or a lawyer before you transact.
      </p>
    </div>
  );
}
