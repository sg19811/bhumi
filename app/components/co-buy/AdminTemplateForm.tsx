"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

export default function AdminTemplateForm({ existing }: { existing?: Record<string, unknown> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    template_key: (existing?.template_key as string) ?? "",
    display_name: (existing?.display_name as string) ?? "",
    channel: (existing?.channel as string) ?? "whatsapp",
    language: (existing?.language as string) ?? "en",
    body: (existing?.body as string) ?? "",
    active: existing?.active !== false,
  });
  const set = (k: string, v: unknown) => setF((c) => ({ ...c, [k]: v }));

  async function save() {
    if (!f.template_key.trim() || !f.display_name.trim() || !f.body.trim()) { setError("Key, name, and body are required."); return; }
    setBusy(true); setError("");
    const payload = { template_key: f.template_key.trim(), display_name: f.display_name.trim(), channel: f.channel, language: f.language, body: f.body, active: f.active, updated_at: new Date().toISOString() };
    const res = existing ? await supabase.from("acrehub_message_templates").update(payload).eq("id", existing.id as string) : await supabase.from("acrehub_message_templates").insert(payload);
    setBusy(false);
    if (res.error) { setError(res.error.message); return; }
    router.push("/admin/templates");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Key *</span><input value={f.template_key} onChange={(e) => set("template_key", e.target.value)} placeholder="e.g. site_visit_invitation" className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Display name *</span><input value={f.display_name} onChange={(e) => set("display_name", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Channel</span><select value={f.channel} onChange={(e) => set("channel", e.target.value)} className={field}><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option><option value="internal_note">Internal note</option></select></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Language</span><select value={f.language} onChange={(e) => set("language", e.target.value)} className={field}><option value="en">English</option><option value="hi">Hindi</option><option value="kn">Kannada</option><option value="ta">Tamil</option><option value="te">Telugu</option><option value="ml">Malayalam</option></select></label>
      </div>
      <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Body</span><textarea value={f.body} onChange={(e) => set("body", e.target.value)} rows={6} placeholder="Use {{name}}, {{opportunity_title}}, {{location}} etc." className={field} /></label>
      <p className="text-xs text-gray-400">Variables in double braces (e.g. <code>{"{{name}}"}</code>) are filled in when you use the template.</p>
      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-green-700" />Active</label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : existing ? "Save template" : "Create template"}</button>
    </div>
  );
}
