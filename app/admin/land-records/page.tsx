"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { STATES } from "@/app/lib/legal/options";
import type { LandRecordResult } from "@/app/lib/land-records/types";

const inp = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";
const lbl = "mb-1 block text-xs font-medium text-gray-600";

type Keys = { state: string; district: string; taluka: string; village: string; surveyNumber: string; subDivision: string };

export default function LandRecordsAdmin() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";

  const [keys, setKeys] = useState<Keys>({ state: "", district: "", taluka: "", village: "", surveyNumber: "", subDivision: "" });
  const [result, setResult] = useState<LandRecordResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const set = (k: keyof Keys, v: string) => setKeys((c) => ({ ...c, [k]: v }));
  const keysReady = keys.state && keys.district && keys.taluka && keys.village && keys.surveyNumber;

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!keysReady) { setError("Fill state, district, taluka, village and survey number."); return; }
    setBusy(true); setError(""); setResult(null); setSearched(false); setAdding(false);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/land-records/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify({ ...keys, subDivision: keys.subDivision || undefined }),
    });
    setBusy(false); setSearched(true);
    if (res.ok) setResult(await res.json());
    else if (res.status === 404) setResult(null);
    else setError((await res.json().catch(() => null))?.error?.message || "Search failed.");
  }

  async function addManually(e: React.FormEvent) {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    setBusy(true); setError("");
    const owners = String(f.get("owners") ?? "").split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name }));
    const now = new Date();
    const { error: dbErr } = await supabase.from("land_records").insert({
      state: keys.state, district: keys.district, taluka: keys.taluka, village: keys.village,
      survey_number: keys.surveyNumber, sub_division: keys.subDivision || null,
      source: "manual", retrieved_at: now.toISOString(), expires_at: new Date(now.getTime() + 90 * 86400000).toISOString(),
      owners, extent_value: f.get("extent_value") ? Number(f.get("extent_value")) : null, extent_unit: f.get("extent_unit") || null,
      classification: f.get("classification") || null, encumbrance_status: f.get("encumbrance_status") || null,
      fmb_sketch_url: f.get("fmb_sketch_url") || null,
    });
    setBusy(false);
    if (dbErr) { setError(dbErr.message); return; }
    setAdding(false);
    search();
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <Link href={user ? "/" : "/auth/signin"} className="text-green-700 hover:underline">{user ? "Go home" : "Sign in"}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-xl font-bold">Land records</h1>
        <p className="mt-1 text-sm text-gray-500">Look up a government land record, or add one manually. Linked records show a verification badge on the listing.</p>

        <form onSubmit={search} className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <div>
            <label className={lbl}>State</label>
            <select value={keys.state} onChange={(e) => set("state", e.target.value)} className={inp}>
              <option value="">Select</option>
              {STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div><label className={lbl}>District</label><input value={keys.district} onChange={(e) => set("district", e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Taluka</label><input value={keys.taluka} onChange={(e) => set("taluka", e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Village</label><input value={keys.village} onChange={(e) => set("village", e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Survey number</label><input value={keys.surveyNumber} onChange={(e) => set("surveyNumber", e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Sub-division</label><input value={keys.subDivision} onChange={(e) => set("subDivision", e.target.value)} className={inp} /></div>
          <div className="col-span-2 sm:col-span-3">
            <button type="submit" disabled={busy} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Searching…" : "Search"}</button>
          </div>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {result && (
          <section className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-900">✓ Record found — source: {result.source}</p>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Owners:</span> {result.owners.map((o) => o.name).join(", ") || "—"}</p>
              <p><span className="text-gray-500">Extent:</span> {result.extent.value} {result.extent.unit}</p>
              <p><span className="text-gray-500">Classification:</span> {result.classification || "—"}</p>
              <p><span className="text-gray-500">Encumbrance:</span> {result.encumbranceStatus || "—"}</p>
              <p><span className="text-gray-500">Retrieved:</span> {new Date(result.retrievedAt).toLocaleString("en-IN")}</p>
              {result.fmbSketchUrl && <p><a href={result.fmbSketchUrl} target="_blank" rel="noopener" className="text-green-700 underline">View FMB sketch</a></p>}
            </div>
          </section>
        )}

        {searched && !result && !adding && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            No record on file for this parcel.{" "}
            {keysReady && <button onClick={() => setAdding(true)} className="font-medium text-green-700 hover:underline">Add manually →</button>}
          </div>
        )}

        {adding && (
          <form onSubmit={addManually} className="mt-5 space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Add land record for {keys.village}, {keys.district} (S.No {keys.surveyNumber})</h2>
            <div><label className={lbl}>Owner name(s) — comma separated</label><input name="owners" className={inp} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Extent value</label><input name="extent_value" type="number" step="any" className={inp} /></div>
              <div>
                <label className={lbl}>Extent unit</label>
                <select name="extent_unit" className={inp}>
                  <option value="acres">acres</option><option value="guntas">guntas</option><option value="cents">cents</option><option value="sqm">sqm</option>
                </select>
              </div>
            </div>
            <div><label className={lbl}>Classification</label><input name="classification" placeholder="e.g. dry / wet / converted" className={inp} /></div>
            <div>
              <label className={lbl}>Encumbrance status</label>
              <select name="encumbrance_status" className={inp}>
                <option value="">Unknown</option><option value="clear">Clear</option><option value="has_encumbrance">Has encumbrance</option>
              </select>
            </div>
            <div><label className={lbl}>FMB sketch URL (optional)</label><input name="fmb_sketch_url" className={inp} /></div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : "Save record"}</button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-full border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
