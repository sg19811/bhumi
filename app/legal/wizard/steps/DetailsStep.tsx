"use client";

import { BUDGET_OPTIONS, TIMELINE_OPTIONS } from "@/app/lib/legal/options";
import type { StepProps } from "./stepProps";

export default function DetailsStep({ answers, update }: StepProps) {
  const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";
  return (
    <div>
      <h2 className="text-2xl font-bold">A few more details</h2>
      <p className="mt-1 mb-5 text-gray-600">All optional — but the more you share, the more confident your result.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
          <input className={inp} value={answers.district ?? ""} onChange={(e) => update({ district: e.target.value })} placeholder="e.g. Mysuru" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Taluk / village</label>
          <input className={inp} value={answers.taluk ?? ""} onChange={(e) => update({ taluk: e.target.value })} placeholder="Optional" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Budget</label>
          <select className={inp} value={answers.budget_range ?? ""} onChange={(e) => update({ budget_range: (e.target.value || undefined) as never })}>
            <option value="">Select</option>
            {BUDGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Timeline</label>
          <select className={inp} value={answers.timeline ?? ""} onChange={(e) => update({ timeline: (e.target.value || undefined) as never })}>
            <option value="">Select</option>
            {TIMELINE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-gray-700">Do you have the land documents available?</p>
        <div className="flex flex-wrap gap-2">
          {[
            { v: true, l: "Yes" },
            { v: false, l: "No" },
          ].map((o) => (
            <button
              key={o.l}
              type="button"
              onClick={() => update({ documents_available: o.v })}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                answers.documents_available === o.v ? "border-green-600 bg-green-50 font-medium text-green-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
