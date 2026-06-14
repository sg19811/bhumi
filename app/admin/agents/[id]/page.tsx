"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import {
  agentTypeLabel,
  VERIFICATION_STATUSES,
  PROFILE_STATUSES,
  type AgentProfile,
} from "@/app/lib/agent-types";

type ListingRow = { id: string; title: string | null; status: string | null; created_at: string };
type InboxRow = { id: string; raw_message: string; processed_status: string | null; received_at: string };

const inp = "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-green-600";

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="text-right font-medium text-gray-800">{v || "—"}</span>
    </div>
  );
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [inbox, setInbox] = useState<InboxRow[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Editable fields
  const [verification, setVerification] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [trustTier, setTrustTier] = useState(1);
  const [autoPublish, setAutoPublish] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAdmin || !id) return;
    (async () => {
      const { data: a } = await supabase.from("agent_profiles").select("*").eq("id", id).maybeSingle();
      if (!a) { setNotFound(true); return; }
      setAgent(a);
      setVerification(a.verification_status);
      setProfileStatus(a.profile_status);
      setTrustTier(a.trust_tier ?? 1);
      setAutoPublish(!!a.auto_publish_listings);
      setNotes(a.admin_notes ?? "");

      const [l, i] = await Promise.all([
        supabase.from("listings").select("id, title, status, created_at").eq("agent_id", id).order("created_at", { ascending: false }).limit(50),
        supabase.from("whatsapp_inbox").select("id, raw_message, processed_status, received_at").eq("agent_id", id).order("received_at", { ascending: false }).limit(20),
      ]);
      setListings(l.data ?? []);
      setInbox(i.data ?? []);
    })();
  }, [isAdmin, id]);

  async function patch(fields: Record<string, unknown>) {
    const { error } = await supabase.from("agent_profiles").update(fields).eq("id", id);
    if (!error) setAgent((cur) => (cur ? ({ ...cur, ...fields } as AgentProfile) : cur));
    return !error;
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const ok = await patch({
      verification_status: verification,
      profile_status: profileStatus,
      trust_tier: trustTier,
      auto_publish_listings: autoPublish,
      admin_notes: notes.trim() || null,
    });
    setSaving(false);
    setSaved(ok);
  }

  // Quick action: set verification status (and update local select).
  async function quick(status: string) {
    setVerification(status);
    await patch({ verification_status: status });
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
  if (notFound) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Agent not found</h1>
          <Link href="/admin/agents" className="text-green-700 hover:underline">Back to all agents</Link>
        </main>
      </div>
    );
  }
  if (!agent) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading agent…</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/admin/agents" className="text-sm text-green-700 hover:underline">← All agents</Link>
        <h1 className="mt-2 text-2xl font-bold">{agent.name}</h1>
        <p className="text-sm text-gray-500">{agentTypeLabel(agent.agent_type)} · {[agent.district, agent.state].filter(Boolean).join(", ")}</p>

        {/* Quick actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => quick("verified")} className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">Verify</button>
          <button onClick={() => quick("suspended")} className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">Suspend</button>
          <button onClick={() => quick("rejected")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Reject</button>
        </div>

        {/* Profile fields */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Profile</h2>
          <Field k="Phone" v={agent.phone} />
          <Field k="WhatsApp" v={agent.whatsapp} />
          <Field k="Email" v={agent.email} />
          <Field k="Taluka" v={agent.taluka} />
          <Field k="Experience" v={agent.years_experience ? `${agent.years_experience} yrs` : null} />
          <Field k="Bio" v={agent.bio} />
          <Field k="Slug" v={agent.slug} />
          <Field k="Applied" v={new Date(agent.created_at).toLocaleString("en-IN")} />
        </section>

        {/* Management controls */}
        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Manage</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Verification status</span>
              <select value={verification} onChange={(e) => setVerification(e.target.value)} className={`${inp} w-full`}>
                {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Profile status</span>
              <select value={profileStatus} onChange={(e) => setProfileStatus(e.target.value)} className={`${inp} w-full`}>
                {PROFILE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Trust tier (1–5)</span>
              <input type="number" min={1} max={5} value={trustTier} onChange={(e) => setTrustTier(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} className={`${inp} w-full`} />
            </label>
            <label className="flex items-center gap-2 self-end text-sm text-gray-700">
              <input type="checkbox" checked={autoPublish} onChange={(e) => setAutoPublish(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-green-700" />
              Auto-publish this agent&apos;s listings
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-gray-600">Admin notes (internal)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inp} w-full`} />
          </label>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={save} disabled={saving} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
            {saved && <span className="text-sm text-green-700">✓ Saved</span>}
          </div>
        </section>

        {/* Listings */}
        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Listings ({listings.length})</h2>
          {listings.length === 0 ? <p className="text-sm text-gray-400">No listings yet.</p> : (
            <ul className="divide-y divide-gray-100">
              {listings.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link href={`/listing/${l.id}`} className="truncate text-green-700 hover:underline">{l.title || l.id}</Link>
                  <span className="shrink-0 capitalize text-gray-400">{l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Inbox history */}
        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Recent WhatsApp inbox ({inbox.length})</h2>
          {inbox.length === 0 ? <p className="text-sm text-gray-400">No inbox messages yet.</p> : (
            <ul className="divide-y divide-gray-100">
              {inbox.map((m) => (
                <li key={m.id} className="py-2 text-sm">
                  <p className="line-clamp-2 text-gray-700">{m.raw_message}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{m.processed_status} · {new Date(m.received_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
