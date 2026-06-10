"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CoBuyNriWarning from "./CoBuyNriWarning";
import {
  CO_BUY_BUYER_TYPES,
  DESIRED_SHARE_OPTIONS,
  TIMELINE_OPTIONS,
  COOWNERSHIP_COMFORT_OPTIONS,
} from "@/app/lib/co-buy/types";
import { CO_BUY_SERVICE_CATEGORIES } from "@/app/lib/co-buy/service-categories";
import { CO_BUY_ACKNOWLEDGEMENTS } from "@/app/lib/co-buy/disclaimers";

const PURPOSES = ["farming", "farmhouse", "investment", "plantation", "resort", "other"];
const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";
const STEP_TITLES = ["About you", "Contact", "Budget & share", "Your plans", "Logistics", "Acknowledgements"];

type State = Record<string, unknown> & {
  buyer_type: string;
  name: string;
  phone: string;
  purpose: string[];
  service_interests: string[];
  acks: Record<string, boolean>;
};

export default function CoBuyInterestForm({ opportunityId, slug }: { opportunityId: string; slug: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [s, setS] = useState<State>({
    buyer_type: "", name: "", phone: "", whatsapp: "", email: "", city: "",
    budget_min: "", budget_max: "", desired_share_label: "", desired_contribution: "",
    purpose: [], timeline: "", coownership_comfort: "",
    site_visit_interest: false, service_interests: [], preferred_call_time: "", notes: "",
    acks: Object.fromEntries(CO_BUY_ACKNOWLEDGEMENTS.map((a) => [a.key, false])),
  });

  const set = (k: string, v: unknown) => setS((cur) => ({ ...cur, [k]: v }));
  const toggleArr = (k: "purpose" | "service_interests", v: string) =>
    setS((cur) => ({ ...cur, [k]: cur[k].includes(v) ? cur[k].filter((x) => x !== v) : [...cur[k], v] }));
  const setAck = (k: string, v: boolean) => setS((cur) => ({ ...cur, acks: { ...cur.acks, [k]: v } }));

  const allAcksChecked = CO_BUY_ACKNOWLEDGEMENTS.every((a) => s.acks[a.key]);
  const stepValid =
    step === 0 ? !!s.buyer_type :
    step === 1 ? s.name.trim().length > 0 && /\d{10}/.test(s.phone.replace(/\D/g, "")) :
    step === 5 ? allAcksChecked :
    true;

  async function submit() {
    if (!allAcksChecked) return;
    setBusy(true); setError("");
    const body = {
      opportunity_id: opportunityId,
      buyer_type: s.buyer_type, name: s.name, phone: s.phone, whatsapp: s.whatsapp, email: s.email, city: s.city,
      budget_min: s.budget_min, budget_max: s.budget_max, desired_share_label: s.desired_share_label, desired_contribution: s.desired_contribution,
      purpose: s.purpose, timeline: s.timeline, coownership_comfort: s.coownership_comfort,
      site_visit_interest: s.site_visit_interest, service_interests: s.service_interests,
      preferred_call_time: s.preferred_call_time, notes: s.notes,
      ...s.acks,
    };
    try {
      const res = await fetch("/api/co-buy/interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || "Something went wrong. Please try again."); setBusy(false); return; }
      router.push(`/co-buy/${slug}/thanks`);
    } catch {
      setError("Network error. Please try again."); setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Progress */}
      <div className="mb-5 flex items-center gap-1.5">
        {STEP_TITLES.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-green-600" : "bg-gray-200"}`} />
        ))}
      </div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">Step {step + 1} of {STEP_TITLES.length} · {STEP_TITLES[step]}</p>

      {/* Step 0 — buyer type */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Which best describes you?</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CO_BUY_BUYER_TYPES.map((b) => (
              <button key={b.value} type="button" onClick={() => set("buyer_type", b.value)} aria-pressed={s.buyer_type === b.value}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${s.buyer_type === b.value ? "border-green-600 bg-green-50 ring-2 ring-green-600/20" : "border-gray-300 hover:border-green-400"}`}>
                {b.label}
              </button>
            ))}
          </div>
          {s.buyer_type === "nri_oci" && <div className="mt-3"><CoBuyNriWarning /></div>}
        </div>
      )}

      {/* Step 1 — contact */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Your name *
            <input value={s.name} onChange={(e) => set("name", e.target.value)} aria-label="Your name" className={`mt-1 ${field}`} />
          </label>
          <label className="text-sm font-medium text-gray-700">Phone *
            <input value={s.phone} onChange={(e) => set("phone", e.target.value)} inputMode="numeric" aria-label="Phone number" placeholder="10-digit mobile" className={`mt-1 ${field}`} />
          </label>
          <label className="text-sm font-medium text-gray-700">WhatsApp
            <input value={String(s.whatsapp)} onChange={(e) => set("whatsapp", e.target.value)} inputMode="numeric" aria-label="WhatsApp number" placeholder="If different" className={`mt-1 ${field}`} />
          </label>
          <label className="text-sm font-medium text-gray-700">Email
            <input value={String(s.email)} onChange={(e) => set("email", e.target.value)} type="email" aria-label="Email" className={`mt-1 ${field}`} />
          </label>
          <label className="text-sm font-medium text-gray-700">City
            <input value={String(s.city)} onChange={(e) => set("city", e.target.value)} aria-label="City" className={`mt-1 ${field}`} />
          </label>
        </div>
      )}

      {/* Step 2 — budget & share */}
      {step === 2 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Budget — min (₹)
            <input value={String(s.budget_min)} onChange={(e) => set("budget_min", e.target.value)} type="number" aria-label="Minimum budget" className={`mt-1 ${field}`} />
          </label>
          <label className="text-sm font-medium text-gray-700">Budget — max (₹)
            <input value={String(s.budget_max)} onChange={(e) => set("budget_max", e.target.value)} type="number" aria-label="Maximum budget" className={`mt-1 ${field}`} />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Share you have in mind
            <select value={s.desired_share_label as string} onChange={(e) => set("desired_share_label", e.target.value)} className={`mt-1 ${field}`}>
              <option value="">Select</option>
              {DESIRED_SHARE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* Step 3 — plans */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">What&apos;s your purpose? (select any)</p>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((p) => (
                <button key={p} type="button" onClick={() => toggleArr("purpose", p)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${s.purpose.includes(p) ? "border-green-600 bg-green-50 text-green-800" : "border-gray-300 text-gray-700 hover:border-green-400"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700">Timeline
            <select value={s.timeline as string} onChange={(e) => set("timeline", e.target.value)} className={`mt-1 ${field}`}>
              <option value="">Select</option>
              {TIMELINE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">Comfort with co-ownership
            <select value={s.coownership_comfort as string} onChange={(e) => set("coownership_comfort", e.target.value)} className={`mt-1 ${field}`}>
              <option value="">Select</option>
              {COOWNERSHIP_COMFORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* Step 4 — logistics */}
      {step === 4 && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={s.site_visit_interest as boolean} onChange={(e) => set("site_visit_interest", e.target.checked)} className="h-4 w-4 accent-green-700" />
            I&apos;m interested in a site visit
          </label>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Services you might want (optional)</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {CO_BUY_SERVICE_CATEGORIES.map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={s.service_interests.includes(c.key)} onChange={() => toggleArr("service_interests", c.key)} className="h-4 w-4 accent-green-700" />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700">Best time to call
            <input value={String(s.preferred_call_time)} onChange={(e) => set("preferred_call_time", e.target.value)} placeholder="e.g. weekday evenings" aria-label="Best time to call" className={`mt-1 ${field}`} />
          </label>
          <label className="block text-sm font-medium text-gray-700">Anything else?
            <textarea value={String(s.notes)} onChange={(e) => set("notes", e.target.value)} rows={3} aria-label="Notes" className={`mt-1 ${field}`} />
          </label>
        </div>
      )}

      {/* Step 5 — acknowledgements */}
      {step === 5 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Before you submit</h2>
          <p className="text-sm text-gray-500">Please confirm you understand each of these. All are required.</p>
          {CO_BUY_ACKNOWLEDGEMENTS.map((a) => (
            <label key={a.key} className="flex items-start gap-2.5 rounded-xl border border-gray-200 p-3 text-sm text-gray-700">
              <input type="checkbox" checked={!!s.acks[a.key]} onChange={(e) => setAck(a.key, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-700" />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setStep((i) => Math.max(0, i - 1))} disabled={step === 0}
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40">← Back</button>
        {step < STEP_TITLES.length - 1 ? (
          <button type="button" onClick={() => stepValid && setStep((i) => i + 1)} disabled={!stepValid}
            className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">Continue</button>
        ) : (
          <button type="button" onClick={submit} disabled={!allAcksChecked || busy}
            className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
            {busy ? "Submitting…" : "Submit interest"}
          </button>
        )}
      </div>
    </div>
  );
}
