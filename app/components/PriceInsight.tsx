import { formatINRShort } from "@/app/lib/format";
import type { PriceInsight } from "@/app/lib/price-insight";

// Server-rendered, presentational. Shows how a listing's ₹/acre compares to the
// median of nearby/comparable land — the "is this fairly priced?" signal.
export default function PriceInsightPanel({ insight }: { insight: PriceInsight }) {
  const delta = Math.round(insight.deltaPct);
  const abs = Math.abs(delta);
  const cheaper = delta < 0;
  // Within ±8% reads as "about typical" — small samples don't warrant strong claims.
  const typical = abs <= 8;

  const tone = typical
    ? { bar: "bg-gray-400", chip: "bg-gray-100 text-gray-700", word: "about typical" }
    : cheaper
      ? { bar: "bg-green-600", chip: "bg-green-100 text-green-800", word: `${abs}% below typical` }
      : { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-800", word: `${abs}% above typical` };

  // Position this listing on a 0–200% scale where 100% = the median.
  const pos = Math.max(4, Math.min(96, (insight.thisPpa / insight.median) * 50));

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Price insight</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.chip}`}>{tone.word}</span>
      </div>

      <p className="text-sm text-gray-600">
        This land is <span className="font-semibold text-gray-900">{formatINRShort(insight.thisPpa)}/acre</span>.
        The median for {insight.scopeLabel} is{" "}
        <span className="font-semibold text-gray-900">{formatINRShort(insight.median)}/acre</span>.
      </p>

      <div className="relative mt-4 h-2 rounded-full bg-gray-100">
        {/* median marker */}
        <div className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-gray-400" style={{ left: "50%" }} aria-hidden="true" />
        {/* this listing */}
        <div className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${tone.bar}`} style={{ left: `${pos}%` }} aria-hidden="true" />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
        <span>lower</span>
        <span>median</span>
        <span>higher</span>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Based on {insight.sampleSize} comparable active {insight.sampleSize === 1 ? "listing" : "listings"}. A guide only —
        price reflects soil, water, road frontage and documents too. Always verify on the ground.
      </p>
    </div>
  );
}
