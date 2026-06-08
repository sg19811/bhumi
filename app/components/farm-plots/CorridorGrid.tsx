import Link from "next/link";
import { getCorridorsByCity } from "@/app/lib/farm-plots/corridors";

// Grid of corridor cards for a city, with project counts. Zero counts handled
// gracefully. Links are nested under the city: /farm-plots/[city]/[corridor].
export default function CorridorGrid({ citySlug, counts }: { citySlug: string; counts: Record<string, number> }) {
  const corridors = getCorridorsByCity(citySlug);
  if (corridors.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {corridors.map((c) => {
        const n = counts[c.slug] ?? 0;
        return (
          <Link
            key={c.slug}
            href={`/farm-plots/${citySlug}/${c.slug}`}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <span className="block font-semibold text-gray-900">{c.label}</span>
            <span className="mt-1 block text-xs text-gray-500">
              {n > 0 ? `${n} project${n === 1 ? "" : "s"}` : "Coming soon"}
              {c.state === "tamil_nadu" ? " · TN" : ""}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
