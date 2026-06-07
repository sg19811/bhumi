import { formatINRShort } from "@/app/lib/format";
import type { MarketSummary } from "@/app/lib/price-insight";

// Compact ₹/acre market strip for region & land landing pages. Server-rendered.
export default function MarketStats({ summary, scopeLabel }: { summary: MarketSummary; scopeLabel: string }) {
  const cells = [
    { label: "Median price", value: `${formatINRShort(summary.median)}/acre` },
    { label: "Range", value: `${formatINRShort(summary.min)} – ${formatINRShort(summary.max)}` },
    { label: "Priced listings", value: String(summary.sampleSize) },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-green-50/40 p-4 sm:p-5">
      <p className="mb-3 text-sm font-semibold text-gray-700">{scopeLabel} — price snapshot</p>
      <div className="grid grid-cols-3 gap-3">
        {cells.map((c) => (
          <div key={c.label} className="text-center">
            <p className="text-base font-bold text-green-800 sm:text-lg">{c.value}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-gray-400">
        Normalized to ₹/acre across active listings. A guide only — actual value depends on soil, water, access and documents.
      </p>
    </div>
  );
}
