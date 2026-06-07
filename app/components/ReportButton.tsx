"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

const REASONS = ["Fake or fraudulent", "Wrong location/details", "Already sold", "Spam", "Other"];

export default function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function report(reason: string) {
    setBusy(true);
    await supabase.from("reports").insert({ listing_id: listingId, reason });
    setBusy(false);
    setDone(true);
    setOpen(false);
  }

  if (done) return <span className="text-xs text-gray-400">Thanks — reported for review.</span>;

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((o) => !o)} className="text-xs text-gray-400 hover:text-red-600">⚑ Report listing</button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-400">Reason</p>
          {REASONS.map((r) => (
            <button key={r} onClick={() => report(r)} disabled={busy} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50">{r}</button>
          ))}
        </div>
      )}
    </div>
  );
}
