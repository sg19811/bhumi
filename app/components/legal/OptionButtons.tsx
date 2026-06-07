"use client";

import type { Option } from "@/app/lib/legal/options";

// Shared selectable button grid used by the wizard selectors.
export default function OptionButtons<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: Array<Option<T> & { covered?: boolean }>;
  value?: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
}) {
  const cols = columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return (
    <div className={`grid gap-2.5 ${cols}`}>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={selected}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${
              selected
                ? "border-green-600 bg-green-50 ring-2 ring-green-600/20"
                : "border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/40"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-900">{o.label}</span>
              {o.covered === false && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500">In review</span>}
            </span>
            {o.hint && <span className="mt-0.5 block text-xs text-gray-500">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
