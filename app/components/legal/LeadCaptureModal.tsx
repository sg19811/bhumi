"use client";

import { useState } from "react";
import LeadCaptureForm, { type LeadDefaults } from "@/app/components/legal/LeadCaptureForm";

// Popup variant of the lead form, opened by a trigger button.
export default function LeadCaptureModal({
  source,
  defaults,
  triggerLabel = "Talk to a lawyer",
  triggerClassName = "rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800",
}: {
  source: string;
  defaults?: LeadDefaults;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>{triggerLabel}</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute -top-3 right-1 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow sm:-right-3"
              >
                ✕
              </button>
              <LeadCaptureForm source={source} defaults={defaults} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
