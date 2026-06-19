"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

type Group = { id: string; label: string };
type Listing = { id: string; title: string };
type Share = { share_group_label: string; wa_me_url: string; short_url: string };

const DEFAULT_LABELS = ["My Buyer WhatsApp Group", "Local Brokers Group", "Family/Friends"];

// Agent self-service: pick one of your listings, pick which of your saved
// WhatsApp groups to forward to, and get one pre-filled wa.me link per group
// (each tracked separately). LABELS only — AcreHub never touches the groups.
// See growth-engine-spec-aggressive-v2.md §10.1.
export default function AgentForwardingWizard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [newLabel, setNewLabel] = useState("");
  const [shares, setShares] = useState<Share[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [ls, rc, gr] = await Promise.all([
        supabase.from("listings").select("id, title").eq("owner_user_id", user.id).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("referral_codes").select("code").eq("user_id", user.id).limit(1).maybeSingle(),
        supabase.from("agent_share_groups").select("id, label").eq("agent_user_id", user.id).order("created_at"),
      ]);
      if (!active) return;
      setListings((ls.data ?? []) as Listing[]);
      setRefCode(rc.data?.code ?? null);
      if (ls.data?.[0]) setSelectedListing(ls.data[0].id);

      let g = (gr.data ?? []) as Group[];
      // Seed 3 default labels for first-time agents.
      if (g.length === 0) {
        const { data: seeded } = await supabase
          .from("agent_share_groups")
          .insert(DEFAULT_LABELS.map((label) => ({ agent_user_id: user.id, label })))
          .select("id, label");
        if (seeded) g = seeded as Group[];
      }
      if (!active) return;
      setGroups(g);
      setSelectedGroups(new Set(g.map((x) => x.id)));
    })();
    return () => { active = false; };
  }, [user]);

  async function addGroup() {
    const label = newLabel.trim();
    if (!label || !user) return;
    const { data } = await supabase.from("agent_share_groups").insert({ agent_user_id: user.id, label }).select("id, label").maybeSingle();
    if (data) {
      setGroups((g) => [...g, data as Group]);
      setSelectedGroups((s) => new Set(s).add((data as Group).id));
    }
    setNewLabel("");
  }

  async function removeGroup(id: string) {
    await supabase.from("agent_share_groups").delete().eq("id", id);
    setGroups((g) => g.filter((x) => x.id !== id));
    setSelectedGroups((s) => { const n = new Set(s); n.delete(id); return n; });
  }

  function toggle(id: string) {
    setSelectedGroups((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  async function generate() {
    if (!selectedListing || selectedGroups.size === 0) return;
    setBusy(true);
    setShares([]);
    const chosen = groups.filter((g) => selectedGroups.has(g.id));
    const res = await fetch("/api/growth/agents/forward-helper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: selectedListing,
        agent_user_id: user?.id ?? null,
        referral_code: refCode,
        groups: chosen.map((g) => ({ id: g.id, label: g.label })),
      }),
    }).then((r) => r.json()).catch(() => null);
    setBusy(false);
    if (res?.ok) setShares(res.shares ?? []);
  }

  if (!user) return null;
  const field = "rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Forward a listing</h3>
      <p className="mt-1 text-sm text-gray-500">Pick a listing and your groups — we generate a tap-to-send WhatsApp message for each, tracked so you get credit.</p>

      {listings.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">You have no active listings to forward yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <select className={`${field} w-full`} value={selectedListing} onChange={(e) => setSelectedListing(e.target.value)}>
            {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Your groups</p>
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <label className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <input type="checkbox" checked={selectedGroups.has(g.id)} onChange={() => toggle(g.id)} className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600" />
                    <span className="text-gray-800">{g.label}</span>
                  </label>
                  <button onClick={() => removeGroup(g.id)} className="rounded-full px-2 text-gray-400 hover:text-red-600" title="Remove">✕</button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input className={`${field} flex-1`} placeholder="Add a group label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              <button onClick={addGroup} className="rounded-full border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:border-green-600 hover:text-green-800">Add</button>
            </div>
          </div>

          <button onClick={generate} disabled={busy || !selectedListing || selectedGroups.size === 0}
            className="w-full rounded-full bg-green-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
            {busy ? "Generating…" : "Generate share links"}
          </button>

          {shares.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              {shares.map((s, i) => (
                <a key={i} href={s.wa_me_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-100">
                  <span>📱 Send to “{s.share_group_label}”</span>
                  <span aria-hidden>→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
