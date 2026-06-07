"use client";

import Link from "next/link";
import { useCompare } from "@/app/lib/compare";

/**
 * Global floating bar showing the current compare selection. Rendered once in
 * the root layout; hidden until at least one listing is selected.
 */
export default function CompareTray() {
  const { ids, clear, max } = useCompare();
  if (ids.length === 0) return null;

  const ready = ids.length >= 2;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-green-800">{ids.length}</span>
          <span className="text-gray-500">/{max}</span> selected
          {!ready && <span className="ml-1 text-gray-400">· add 1 more to compare</span>}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={clear}
            className="rounded-full px-3 py-2 text-sm text-gray-500 transition-colors hover:text-red-600"
          >
            Clear
          </button>
          {ready ? (
            <Link
              href="/compare"
              className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
            >
              Compare →
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-400">
              Compare →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
