import Link from "next/link";
import { CORRIDORS } from "@/app/lib/farm-plots/corridors";

// Grid of corridor cards with project counts. Zero counts handled gracefully.
export default function CorridorGrid({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CORRIDORS.map((c) => {
        const n = counts[c.slug] ?? 0;
        return (
          <Link
            key={c.slug}
            href={`/farm-plots/${c.slug}`}
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
