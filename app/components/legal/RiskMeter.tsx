"use client";

import { useState } from "react";
import type { RiskScore } from "@/app/lib/legal/types";
import { RISK_LEVEL_META, toneBar, toneClasses } from "@/app/lib/legal/copy";

const CATEGORY_LABEL: Record<string, string> = {
  buyer_eligibility: "Buyer eligibility",
  ownership: "Ownership",
  title_chain: "Title chain",
  encumbrance: "Encumbrance",
  mutation: "Mutation",
  survey: "Survey / boundary",
  litigation: "Litigation",
  access: "Road access",
  conversion_zoning: "Conversion / zoning",
  family_co_owner: "Family / co-owners",
  possession: "Possession",
  agent_credibility: "Agent credibility",
};

function catTone(score: number) {
  return score >= 75 ? "red" : score >= 50 ? "amber" : "green";
}

export default function RiskMeter({ risk }: { risk: RiskScore }) {
  const [open, setOpen] = useState(false);
  const meta = RISK_LEVEL_META[risk.level];
  const pct = Math.max(2, Math.min(100, risk.overall));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Estimated risk</h3>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${toneClasses[meta.tone]}`}>{meta.label}</span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>lower risk</span>
          <span>higher risk</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gradient-to-r from-green-100 via-amber-100 to-red-100">
          <div className={`h-full rounded-full ${toneBar[meta.tone]} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-right text-sm font-semibold text-gray-700">{risk.overall}/100</p>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        We can only estimate risk from your answers ({risk.data_confidence}% data confidence). Document review will refine this.
      </p>

      <button type="button" onClick={() => setOpen(!open)} className="mt-3 text-sm font-medium text-green-800 hover:underline" aria-expanded={open}>
        {open ? "Hide" : "Why this score"} →
      </button>

      {open && (
        <ul className="mt-3 space-y-2">
          {Object.entries(risk.categories).map(([key, c]) => {
            const tone = catTone(c.score);
            return (
              <li key={key} className="flex items-start gap-3 text-sm">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneBar[tone]}`} aria-hidden="true" />
                <span>
                  <span className="font-medium text-gray-800">{CATEGORY_LABEL[key] ?? key}</span>
                  <span className="text-gray-500"> — {c.reason}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
