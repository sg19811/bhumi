"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { track, readUtm } from "@/app/lib/legal/analytics";
import { STATES } from "@/app/lib/legal/options";

export type LeadDefaults = {
  state?: string;
  district?: string;
  land_type?: string;
  buyer_type?: string;
  legal_concern?: string;
  related_result_id?: string;
  related_service_slug?: string;
  related_lawyer_id?: string;
};

// Reusable lead-capture form. Writes to legal_inquiries (RLS: insert-only).
export default function LeadCaptureForm({
  source,
  defaults = {},
  compact = false,
  heading = "Talk to a verified lawyer",
  subheading = "Share your details and we'll connect you with a land lawyer for your state. No obligation.",
}: {
  source: string;
  defaults?: LeadDefaults;
  compact?: boolean;
  heading?: string;
  subheading?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("company")) return; // honeypot
    if (!f.get("consent")) {
      setError("Please tick the consent box so we can contact you.");
      return;
    }
    setSubmitting(true);
    setError("");
    const utm = readUtm();
    const concern = (f.get("legal_concern") as string) || defaults.legal_concern || null;
    const { error: dbError } = await supabase.from("legal_inquiries").insert({
      name: f.get("name"),
      phone: f.get("phone"),
      whatsapp: f.get("whatsapp") || null,
      email: f.get("email") || null,
      state: (f.get("state") as string) || defaults.state || null,
      district: defaults.district || null,
      land_type: defaults.land_type || null,
      buyer_type: defaults.buyer_type || null,
      legal_concern: concern,
      related_result_id: defaults.related_result_id || null,
      related_service_slug: defaults.related_service_slug || null,
      related_lawyer_id: defaults.related_lawyer_id || null,
      source_page: source,
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
    });
    setSubmitting(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    track("legal_lead_captured", {
      source_page: source,
      state: (f.get("state") as string) || defaults.state || null,
      concern_category: concern,
      has_email: !!f.get("email"),
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div>
        <h3 className="text-lg font-semibold text-green-900">Thanks — we&apos;ll be in touch</h3>
        <p className="mt-1 text-sm text-green-800">Our team will reach out to connect you with a verified lawyer. Meanwhile, you can keep exploring the guides.</p>
      </div>
    );
  }

  const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900">{heading}</h3>
      <p className="mt-1 text-sm text-gray-500">{subheading}</p>

      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <input name="name" required placeholder="Your name" className={inp} />
        <input name="phone" required inputMode="tel" placeholder="Phone number" className={inp} />
        {!compact && <input name="whatsapp" inputMode="tel" placeholder="WhatsApp (optional)" className={inp} />}
        {!compact && <input name="email" type="email" placeholder="Email (optional)" className={inp} />}
        {!defaults.state && (
          <select name="state" defaultValue="" className={inp} aria-label="State">
            <option value="">State (optional)</option>
            {STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
        <textarea name="legal_concern" rows={compact ? 2 : 3} placeholder="What do you need help with? (optional)" className={`${inp} ${compact ? "" : "sm:col-span-2"}`} />
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-gray-500">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700" />
        <span>I agree to be contacted by AcreHub about my enquiry. This is not legal advice; AcreHub is not a law firm.</span>
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="mt-4 w-full rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
        {submitting ? "Sending…" : "Request a callback"}
      </button>
    </form>
  );
}
