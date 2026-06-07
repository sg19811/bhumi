"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { STATES, LAND_TYPE_OPTIONS } from "@/app/lib/legal/options";
import { track } from "@/app/lib/legal/analytics";
import ChecklistItem from "@/app/components/legal/ChecklistItem";
import LawyerCTA from "@/app/components/legal/LawyerCTA";

const BASE_DOCS = [
  "Latest title deed (current sale deed)",
  "Mother deed / prior title chain (30+ years)",
  "Encumbrance Certificate (EC)",
  "Mutation / khata extract in seller's name",
  "Survey sketch & boundary map",
  "Land tax / revenue receipts (up to date)",
  "Seller ID & address proof",
];

const LAND_EXTRAS: Record<string, string[]> = {
  na_converted: ["NA (land conversion) order"],
  farmhouse: ["Building plan approval (if constructing)"],
  developed_rural: ["Layout approval / plan sanction"],
  farm_plot: ["Layout approval / plan sanction"],
  gated_farm: ["Layout approval", "Project / developer agreement"],
  plantation: ["Plantation / crop records"],
  orchard: ["Plantation / crop records"],
  estate: ["Plantation / crop records"],
};

export default function ChecklistPage() {
  const [state, setState] = useState("");
  const [landType, setLandType] = useState("");
  const [stateDocs, setStateDocs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Pull the state's curated common_documents (published rules only).
  useEffect(() => {
    if (!state) { setStateDocs(null); return; }
    setLoading(true);
    supabase
      .from("legal_state_rules")
      .select("data")
      .eq("state", state)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        const docs = (data?.data as { common_documents?: string[] } | undefined)?.common_documents;
        setStateDocs(docs ?? null);
        setLoading(false);
      });
  }, [state]);

  const docs = useMemo(() => {
    const set = new Set<string>(BASE_DOCS);
    (stateDocs ?? []).forEach((d) => set.add(d));
    (LAND_EXTRAS[landType] ?? []).forEach((d) => set.add(d));
    return [...set];
  }, [stateDocs, landType]);

  const ready = !!state && !!landType;

  useEffect(() => {
    if (ready) track("legal_checklist_generated", { state, land_type: landType, buyer_type: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state, landType]);

  const sel = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold">Document checklist</h1>
      <p className="mt-2 text-gray-600">Pick your state and land type to get a tailored checklist of documents to verify.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <select className={sel} value={state} onChange={(e) => setState(e.target.value)} aria-label="State">
          <option value="">Select state</option>
          {STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className={sel} value={landType} onChange={(e) => setLandType(e.target.value)} aria-label="Land type">
          <option value="">Select land type</option>
          {LAND_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {!ready ? (
        <p className="mt-8 rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
          Choose a state and land type to see your checklist.
        </p>
      ) : (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{docs.length} documents to verify</h2>
            {loading && <span className="text-xs text-gray-400">Loading state rules…</span>}
          </div>
          {!stateDocs && (
            <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              State-specific documents for this state aren&apos;t published yet — showing the universal checklist. A lawyer can tailor it.
            </p>
          )}
          <div className="space-y-2.5">
            {docs.map((d) => <ChecklistItem key={d} label={d} />)}
          </div>
          <div className="mt-8">
            <LawyerCTA context="checklist" state={state} label="Get a lawyer to verify these documents" />
          </div>
        </div>
      )}
    </main>
  );
}
