import { computeSuitability } from "@/app/lib/suitability";

const labelStyle: Record<string, string> = {
  Great: "bg-green-100 text-green-800",
  Good: "bg-amber-50 text-amber-700",
  Limited: "bg-gray-100 text-gray-500",
};

/** Indicative "what's this land good for?" panel. Server-safe. */
export default function SuitabilityPanel({ listing }: { listing: Parameters<typeof computeSuitability>[0] }) {
  const items = computeSuitability(listing);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">What&apos;s this land good for?</h2>
      <p className="mb-4 mt-0.5 text-sm text-gray-500">Indicative, based on the listed features — not a guarantee.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.purpose} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-900">{it.purpose}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${labelStyle[it.label]}`}>{it.label}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{it.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
