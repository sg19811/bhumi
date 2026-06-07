"use client";

// Presentational checklist row with a local checked state (no persistence).
import { useState } from "react";

export default function ChecklistItem({ label, hint }: { label: string; hint?: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:border-green-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green-700"
      />
      <span>
        <span className={`font-medium ${checked ? "text-gray-400 line-through" : "text-gray-900"}`}>{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );
}
