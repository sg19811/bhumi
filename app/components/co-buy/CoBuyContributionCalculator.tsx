"use client";

import { useState } from "react";
import { contributionEstimate } from "@/app/lib/co-buy/calculator";
import { formatINRShort } from "@/app/lib/format";

// Indicative contribution calculator. Defaults seed from the opportunity; the
// real split is set by the registered documents, not this tool.
export default function CoBuyContributionCalculator({
  totalPrice,
  totalAcres,
  targetMembers,
}: {
  totalPrice?: number | null;
  totalAcres?: number | null;
  targetMembers?: number | null;
}) {
  const [price, setPrice] = useState(String(totalPrice || 50000000));
  const [acres, setAcres] = useState(String(totalAcres || 20));
  const [budget, setBudget] = useState("5000000");
  const [members, setMembers] = useState(String(targetMembers || 10));

  const result = contributionEstimate({
    totalPrice: Number(price),
    totalAcres: Number(acres),
    buyerBudget: Number(budget),
    targetMembers: Math.max(1, Math.floor(Number(members))),
  });

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Contribution calculator</h2>
      <p className="mb-4 mt-0.5 text-sm text-gray-500">Estimate the share your budget could fund. Indicative only.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Total parcel price (₹)
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Total area (acres)
          <input type="number" min="0" step="0.1" value={acres} onChange={(e) => setAcres(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Your budget (₹)
          <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-sm font-medium text-gray-700">Target group size
          <input type="number" min="1" value={members} onChange={(e) => setMembers(e.target.value)} className={`mt-1 ${field}`} />
        </label>
      </div>

      {result ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
            <p className="text-xl font-bold text-green-800">{result.sharePct}%</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">your share</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
            <p className="text-xl font-bold text-green-800">{result.shareAcres}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">acres (approx)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
            <p className="text-xl font-bold text-green-800">{formatINRShort(result.allInForShare)}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">all-in for share</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
            <p className="text-xl font-bold text-green-800">{formatINRShort(result.evenSharePrice)}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">even split / member</p>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-400">Enter the parcel price, area, and your budget to see an estimate.</p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        &ldquo;All-in&rdquo; assumes ~12% over the land price for stamp duty, registration, legal, and coordination — actual costs vary.
        This is a planning estimate, not an offer. The real share is set by lawyer-reviewed registered documents.
      </p>
    </div>
  );
}
