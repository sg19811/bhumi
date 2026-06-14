"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { agentTypeLabel, VERIFICATION_STATUSES, type AgentProfile } from "@/app/lib/agent-types";

type Row = Pick<AgentProfile, "id" | "name" | "phone" | "state" | "district" | "agent_type" | "verification_status" | "profile_status" | "trust_tier" | "created_at">;

const STATUS_TONE: Record<string, string> = {
  verified: "bg-green-100 text-green-800",
  territory_verified: "bg-green-100 text-green-800",
  phone_verified: "bg-blue-100 text-blue-700",
  id_submitted: "bg-blue-100 text-blue-700",
  pending_review: "bg-amber-100 text-amber-800",
  suspended: "bg-red-100 text-red-700",
  rejected: "bg-gray-200 text-gray-600",
};

export default function AllAgentsPage() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<Row[]>([]);
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("agent_profiles")
      .select("id, name, phone, state, district, agent_type, verification_status, profile_status, trust_tier, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [isAdmin]);

  const states = useMemo(() => Array.from(new Set(rows.map((r) => r.state).filter(Boolean))).sort(), [rows]);
  const filtered = rows.filter((r) => {
    if (stateFilter && r.state !== stateFilter) return false;
    if (statusFilter && r.verification_status !== statusFilter) return false;
    if (districtFilter && !(r.district ?? "").toLowerCase().includes(districtFilter.toLowerCase())) return false;
    return true;
  });

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

  const sel = "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-green-600";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Agents ({filtered.length})</h1>
          <Link href="/admin/agents/applications" className="text-sm text-green-700 hover:underline">Pending applications →</Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={sel}>
            <option value="">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} placeholder="District…" className={sel} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={sel}>
            <option value="">All statuses</option>
            {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">No agents match these filters.</p>
        ) : (
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            {filtered.map((a) => (
              <Link key={a.id} href={`/admin/agents/${a.id}`} className="flex flex-col gap-1 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {a.name}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[a.verification_status] ?? "bg-gray-100 text-gray-600"}`}>
                      {(a.verification_status ?? "").replace(/_/g, " ")}
                    </span>
                    {a.profile_status !== "active" && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">{a.profile_status}</span>}
                  </p>
                  <p className="text-xs text-gray-600">📞 {a.phone} · {[a.district, a.state].filter(Boolean).join(", ")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">{agentTypeLabel(a.agent_type)}</span>
                  <span>Tier {a.trust_tier ?? 1}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
