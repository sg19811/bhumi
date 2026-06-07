"use client";

import { useState } from "react";
import { track } from "@/app/lib/legal/analytics";
import { DISCLAIMER_RESULT, AI_MARKER } from "@/app/lib/legal/copy";

// Inline, expandable disclaimer block. `variant` picks the wording.
export default function LegalDisclaimer({
  variant = "result",
  page = "",
}: {
  variant?: "result" | "ai";
  page?: string;
}) {
  const [open, setOpen] = useState(false);
  const text = variant === "ai" ? AI_MARKER : DISCLAIMER_RESULT;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) track("legal_disclaimer_expanded", { page });
        }}
        className="flex w-full items-center justify-between gap-2 text-left font-semibold"
        aria-expanded={open}
      >
        <span>⚠ Informational only — not legal advice</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-2 leading-relaxed">{text}</p>}
    </div>
  );
}
