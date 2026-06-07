"use client";

import { useCompare } from "@/app/lib/compare";

/**
 * Add/remove a listing from the compare set. Rendered inside the ListingCard
 * <Link>, so it stops click propagation to avoid navigating.
 */
export default function CompareToggle({ id }: { id: string }) {
  const { has, toggle, ids, max } = useCompare();
  const active = has(id);
  const full = !active && ids.length >= max;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      disabled={full}
      title={full ? `Compare up to ${max} at a time` : undefined}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur transition-colors ${
        active ? "bg-green-700 text-white" : "bg-white/95 text-gray-700 hover:text-green-800"
      } ${full ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {active ? "✓ Compare" : "+ Compare"}
    </button>
  );
}
