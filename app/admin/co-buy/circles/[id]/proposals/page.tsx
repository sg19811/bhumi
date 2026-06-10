"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { DEFAULT_PROPOSAL_OPTIONS } from "@/app/lib/co-buy/post-purchase/constants";

const inp = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";
type Row = Record<string, unknown> & { id: string };

export default function AdminProposals() {
  const { user, role, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [proposals, setProposals] = useState<Row[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() { const { data } = await supabase.from("co_buy_proposals").select("*").eq("circle_id", id).order("created_at", { ascending: false }); setProposals((data as Row[]) ?? []); }
  useEffect(() => {
    if (role !== "admin" || !id) return;
    (async () => { await reload(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  async function create() {
    if (!title.trim() || !description.trim()) return;
    setBusy(true);
    await supabase.from("co_buy_proposals").insert({ circle_id: id, title: title.trim(), description: description.trim(), options: DEFAULT_PROPOSAL_OPTIONS, status: "open" });
    setBusy(false); setTitle(""); setDescription(""); reload();
  }
  async function close(p: Row) { const notes = prompt("Decision (what was actually decided)?", (p.decision_notes as string) ?? ""); await supabase.from("co_buy_proposals").update({ status: "closed", closed_at: new Date().toISOString(), decision_notes: notes ?? null }).eq("id", p.id); reload(); }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900"><Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/admin/co-buy/circles/${id}`} className="hover:text-green-800">Circle</Link> / Proposals</nav>
        <h1 className="mb-4 text-3xl font-bold">Proposals</h1>
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Proposal title" className={`mb-2 ${inp}`} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" className={`mb-2 ${inp}`} />
          <button onClick={create} disabled={busy} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">Create proposal (Yes/No/Abstain)</button>
        </div>
        <div className="space-y-2">
          {proposals.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 text-sm">
              <div><p className="font-medium">{p.title as string}</p><p className="text-xs text-gray-400">{p.status as string}{p.decision_notes ? ` · decided: ${p.decision_notes as string}` : ""}</p></div>
              {p.status === "open" && <button onClick={() => close(p)} className="shrink-0 text-xs font-medium text-green-800 hover:underline">Close + record decision</button>}
            </div>
          ))}
          {proposals.length === 0 && <p className="text-sm text-gray-400">No proposals yet.</p>}
        </div>
      </main>
    </div>
  );
}
