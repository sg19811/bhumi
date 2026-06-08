import { buildBuyerDecision } from "@/app/lib/buyer-decision";
import type { PriceInsight } from "@/app/lib/price-insight";

/**
 * Buyer Decision Dashboard — an at-a-glance "should you consider this plot?"
 * summary: strengths, things to check before buying, and what it's best suited
 * for. Server-safe and presentational; all logic lives in buildBuyerDecision.
 */
export default function BuyerDecisionPanel({
  listing,
  priceInsight,
}: {
  listing: Parameters<typeof buildBuyerDecision>[0];
  priceInsight?: PriceInsight | null;
}) {
  const { strengths, risks, bestFor } = buildBuyerDecision(listing, priceInsight);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Should you consider this plot?</h2>
      <p className="mb-5 mt-0.5 text-sm text-gray-500">
        An honest, automated read of the listed details — not advice. Always do your own checks.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Strengths */}
        <div>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-green-800">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Strengths
          </h3>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((s) => (
                <li key={s} className="flex gap-2 text-sm leading-snug text-gray-700">
                  <span aria-hidden="true" className="mt-0.5 select-none text-green-700">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No standout strengths from the listed details yet.</p>
          )}
        </div>

        {/* Check before buying */}
        <div>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            Check before buying
          </h3>
          <ul className="space-y-2">
            {risks.map((r) => (
              <li key={r} className="flex gap-2 text-sm leading-snug text-gray-700">
                <span aria-hidden="true" className="mt-0.5 select-none font-bold text-amber-600">!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {bestFor.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <span aria-hidden="true">🎯</span> Best suited for
          </h3>
          <div className="flex flex-wrap gap-2">
            {bestFor.map((p) => (
              <span key={p} className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
