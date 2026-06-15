import Link from "next/link";
import { citiesByState } from "@/app/lib/farm-plots/cities";

// City cards for the hub, grouped by state. Live cities show their project count;
// coming-soon cities are clearly labelled but still link through (to a coming-soon
// page) so the PAN-India structure is visible and crawlable.
export default function CityGrid({ counts }: { counts: Record<string, number> }) {
  const groups = citiesByState();
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.state}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{g.state}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.cities.map((c) => {
              const n = counts[c.slug] ?? 0;
              const live = c.status === "live";
              return (
                <Link
                  key={c.slug}
                  href={`/farm-plots/${c.slug}`}
                  className={`group rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    live ? "border-green-200 bg-green-50 hover:border-green-300" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{c.label}</span>
                    {live ? (
                      <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-medium text-white">
                        {n > 0 ? `${n} project${n === 1 ? "" : "s"}` : "Live"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Coming soon</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500">{c.tagline}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
