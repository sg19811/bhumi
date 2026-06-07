import Link from "next/link";
import { getCorridor, corridorLabel } from "@/app/lib/farm-plots/corridors";

// Links to /farm-plots/[corridor]. Renders nothing for an unknown/empty slug.
export default function CorridorBadge({ slug }: { slug?: string | null }) {
  if (!getCorridor(slug)) return null;
  return (
    <Link
      href={`/farm-plots/${slug}`}
      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 transition-colors hover:bg-green-200"
    >
      📍 {corridorLabel(slug)}
    </Link>
  );
}
