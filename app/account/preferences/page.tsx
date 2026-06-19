"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

const LANGS: Array<[string, string]> = [
  ["en", "English"], ["hi", "हिन्दी"], ["kn", "ಕನ್ನಡ"],
  ["ta", "தமிழ்"], ["te", "తెలుగు"], ["mr", "मराठी"],
];

const CHANNELS: Array<{ key: "opt_in_whatsapp" | "opt_in_email" | "opt_in_sms" | "opt_in_telegram"; label: string }> = [
  { key: "opt_in_whatsapp", label: "WhatsApp" },
  { key: "opt_in_email", label: "Email" },
  { key: "opt_in_sms", label: "SMS" },
  { key: "opt_in_telegram", label: "Telegram" },
];

type Prefs = {
  id?: string;
  phone: string;
  whatsapp: string;
  email: string;
  opt_in_whatsapp: boolean;
  opt_in_email: boolean;
  opt_in_sms: boolean;
  opt_in_telegram: boolean;
  preferred_language: string;
};

const EMPTY: Prefs = {
  phone: "", whatsapp: "", email: "",
  opt_in_whatsapp: false, opt_in_email: false, opt_in_sms: false, opt_in_telegram: false,
  preferred_language: "en",
};

export default function PreferencesPage() {
  const { user, loading } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(EMPTY);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("contact_preferences")
        .select("id, phone, whatsapp, email, opt_in_whatsapp, opt_in_email, opt_in_sms, opt_in_telegram, preferred_language")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (data) setPrefs({ ...EMPTY, ...data, email: data.email ?? user.email ?? "" });
      else setPrefs({ ...EMPTY, email: user.email ?? "" });
      setReady(true);
    })();
    return () => { active = false; };
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    const anyOptIn = prefs.opt_in_whatsapp || prefs.opt_in_email || prefs.opt_in_sms || prefs.opt_in_telegram;
    const now = new Date().toISOString();
    const fields = {
      user_id: user.id,
      phone: prefs.phone || null,
      whatsapp: prefs.whatsapp || null,
      email: prefs.email || null,
      opt_in_whatsapp: prefs.opt_in_whatsapp,
      opt_in_email: prefs.opt_in_email,
      opt_in_sms: prefs.opt_in_sms,
      opt_in_telegram: prefs.opt_in_telegram,
      preferred_language: prefs.preferred_language,
      opt_in_source: "preferences_page",
      opt_in_at: anyOptIn ? now : null,
      opt_out_at: anyOptIn ? null : now,
    };
    if (prefs.id) await supabase.from("contact_preferences").update(fields).eq("id", prefs.id);
    else {
      const { data } = await supabase.from("contact_preferences").insert(fields).select("id").maybeSingle();
      if (data?.id) setPrefs((p) => ({ ...p, id: data.id }));
    }
    setSaving(false);
    setSaved(true);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Sign in to manage preferences</h1>
          <Link href="/auth/signin" className="mt-4 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Sign in</Link>
        </main>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-2xl font-bold">Notification preferences</h1>
        <p className="mt-2 text-sm text-gray-600">Choose how (and whether) AcreHub may contact you with new listings and updates. You can turn everything off anytime.</p>

        {!ready ? (
          <p className="mt-8 text-gray-400">Loading…</p>
        ) : (
          <form onSubmit={save} className="mt-8 space-y-6">
            <div className="space-y-3">
              {CHANNELS.map((c) => (
                <label key={c.key} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={prefs[c.key]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [c.key]: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-green-700 focus:ring-green-600"
                  />
                  <span className="font-medium text-gray-800">{c.label}</span>
                </label>
              ))}
            </div>

            <div className="grid gap-3">
              <input className={field} placeholder="Phone" value={prefs.phone} onChange={(e) => setPrefs((p) => ({ ...p, phone: e.target.value }))} />
              <input className={field} placeholder="WhatsApp number" value={prefs.whatsapp} onChange={(e) => setPrefs((p) => ({ ...p, whatsapp: e.target.value }))} />
              <input className={field} type="email" placeholder="Email" value={prefs.email} onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.value }))} />
              <select className={field} value={prefs.preferred_language} onChange={(e) => setPrefs((p) => ({ ...p, preferred_language: e.target.value }))}>
                {LANGS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>

            <button type="submit" disabled={saving} className="w-full rounded-full bg-green-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
              {saving ? "Saving…" : "Save preferences"}
            </button>
            {saved && <p className="text-center text-sm text-green-700">✓ Saved</p>}
          </form>
        )}
      </main>
    </div>
  );
}
