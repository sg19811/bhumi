"use client";

import { useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

// "Draft with AI" for the listing description. Reads the surrounding form's fields,
// asks the server route (key-holding, signed-in only) for an honest description,
// and writes it into the description textarea. No facts are invented server-side.
const FIELD_NAMES = [
  "title", "land_type", "project_name", "developer_name", "village", "taluka", "district",
  "corridor", "nearest_city", "price", "area_value", "area_unit", "plot_count",
  "plot_size_min_value", "plot_size_max_value", "plot_size_unit", "project_stage",
  "possession_timeline", "water_source", "road_access", "layout_approval_status", "conversion_status",
];

export default function AiListingAssist() {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true); setError(null);
    const form = ref.current?.closest("form");
    const textarea = form?.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
    if (!form || !textarea) { setError("Couldn't find the form."); setBusy(false); return; }

    const fd = new FormData(form);
    const fields: Record<string, string> = {};
    for (const name of FIELD_NAMES) { const v = fd.get(name); if (v != null && String(v) !== "") fields[name] = String(v); }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setError("Please sign in to use the AI assistant."); setBusy(false); return; }

    try {
      const res = await fetch("/api/farm-plots/ai-listing-assist", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ fields, description: textarea.value }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.error || "Couldn't draft a description."); setBusy(false); return; }
      // Set the value and notify React-controlled listeners if any.
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(textarea, json.description || "");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    } catch {
      setError("Couldn't draft a description. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div ref={ref} className="mt-2">
      <button type="button" onClick={run} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
        ✨ {busy ? "Drafting…" : "Draft with AI"}
      </button>
      <span className="ml-2 text-xs text-gray-400">Uses the details you&apos;ve entered. Review before saving.</span>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
