"use client";

import { useState } from "react";
import {
  AGENT_TYPES,
  AGENT_TYPE_LABELS,
  AGENT_STATE_OPTIONS,
  type AgentType,
} from "@/app/lib/agent-types";
import { applicationReceivedMessage } from "@/app/lib/message-templates";

const ETHICS_POINTS = [
  "Only submit genuine land opportunities I have reasonable authority to market.",
  "Not misrepresent ownership, title, price, access, or legal status of any property.",
  "Not upload photos I don't have permission to use.",
  "Respect seller privacy and not share owner contact details without consent.",
  "Update or withdraw listings that are sold or no longer available.",
  "Avoid unofficial payments or any illegal facilitation.",
  "Accept that AcrehubIndia may suspend agents for fake, duplicate, or unethical listings.",
];

const inp =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

export default function AgentJoinForm() {
  const [submitting, setSubmitting] = useState(false);
  const [doneName, setDoneName] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);

    if (!f.get("ethics_acknowledged")) {
      setError("Please accept the agent ethics commitment to continue.");
      return;
    }
    const name = String(f.get("name") ?? "").trim();
    if (name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/agents/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: f.get("phone"),
        whatsapp: f.get("whatsapp") || undefined,
        email: f.get("email") || undefined,
        state: f.get("state"),
        district: f.get("district"),
        taluka: f.get("taluka") || undefined,
        agent_type: f.get("agent_type"),
        bio: f.get("bio") || undefined,
        ethics_acknowledged: true,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message || "Couldn't submit your application. Please try again.");
      return;
    }
    setDoneName(name);
  }

  if (doneName) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div>
        <h3 className="text-lg font-semibold text-green-900">Application received</h3>
        <p className="mt-2 whitespace-pre-line text-sm text-green-800">
          {applicationReceivedMessage({ agentName: doneName })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required minLength={2} maxLength={100} aria-label="Full name" placeholder="Full name *" className={inp} />
        <input name="phone" required inputMode="tel" aria-label="Phone number" placeholder="Phone number *" pattern="(\+91[-\s]?)?[0-9]{10}" title="Enter a 10-digit Indian number, optionally with +91" className={inp} />
        <input name="whatsapp" inputMode="tel" aria-label="WhatsApp number (optional)" placeholder="WhatsApp (if different)" className={inp} />
        <input name="email" type="email" aria-label="Email (optional)" placeholder="Email (optional)" className={inp} />
        <select name="state" required defaultValue="" aria-label="Primary state" className={inp}>
          <option value="" disabled>Primary state *</option>
          {AGENT_STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="district" required aria-label="Primary district" placeholder="Primary district *" className={inp} />
        <input name="taluka" aria-label="Primary taluka (optional)" placeholder="Primary taluka (optional)" className={`${inp} sm:col-span-2`} />
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-gray-700">What kind of agent are you? *</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {AGENT_TYPES.map((t: AgentType) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              <input type="radio" name="agent_type" value={t} required className="h-4 w-4 text-green-700" />
              <span>{AGENT_TYPE_LABELS[t]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <textarea name="bio" rows={3} maxLength={500} aria-label="Tell us about your work (optional)" placeholder="Tell us about your work — areas you cover, kind of land you handle (optional)" className={`${inp} mt-4`} />

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-800">By joining the Acrehub Agent Network, I agree to:</p>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
          {ETHICS_POINTS.map((p) => (
            <li key={p} className="flex gap-2"><span className="text-green-700">•</span><span>{p}</span></li>
          ))}
        </ul>
        <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" name="ethics_acknowledged" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700" />
          <span>I have read and accept this commitment.</span>
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="mt-5 w-full rounded-full bg-green-700 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
        {submitting ? "Submitting…" : "Apply to join"}
      </button>
    </form>
  );
}
