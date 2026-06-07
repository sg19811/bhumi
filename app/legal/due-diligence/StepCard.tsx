"use client";

import { useState } from "react";
import type { DDStep } from "@/app/lib/legal/dueDiligence";

export default function StepCard({
  step,
  index,
  completed,
  onToggle,
}: {
  step: DDStep;
  index: number;
  completed: boolean;
  onToggle: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-colors sm:p-5 ${completed ? "border-green-300 bg-green-50/50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(!completed)}
          aria-pressed={completed}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
            completed ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-400 hover:border-green-500"
          }`}
        >
          {completed ? "✓" : index + 1}
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={open}>
            <h3 className={`font-semibold ${completed ? "text-green-900" : "text-gray-900"}`}>{step.title}</h3>
            <span className="text-gray-400" aria-hidden="true">{open ? "−" : "+"}</span>
          </button>
          <p className="mt-0.5 text-sm text-gray-600">{step.what}</p>
          {open && (
            <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              <span className="font-medium text-gray-700">How: </span>{step.how}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
