import { computeLandHealth } from "@/app/lib/land-health";

function barColor(score: number) {
  return score >= 75 ? "bg-green-600" : score >= 50 ? "bg-amber-500" : "bg-gray-400";
}
function tierLabel(score: number) {
  return score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Basic";
}

/**
 * Land Health Score — indicative 0–100 rating of the land's physical and legal
 * quality with a per-dimension bar breakdown. Server-safe; logic in computeLandHealth.
 */
export default function LandHealthPanel({ listing }: { listing: Parameters<typeof computeLandHealth>[0] }) {
  const { score, dimensions } = computeLandHealth(listing);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Land Health Score</h2>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-green-800">{score}</span>
          <span className="text-sm text-gray-400">/ 100 · {tierLabel(score)}</span>
        </div>
      </div>
      <p className="mb-4 mt-0.5 text-sm text-gray-500">
        Indicative, from the listed features — rates the land itself, not the listing. Not a survey or guarantee.
      </p>

      <div className="space-y-3.5">
        {dimensions.map((d) => (
          <div key={d.key}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{d.label}</span>
              <span className="text-gray-400">{d.score}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${barColor(d.score)}`} style={{ width: `${d.score}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{d.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
