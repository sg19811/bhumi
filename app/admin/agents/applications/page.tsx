"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { agentTypeLabel, type AgentProfile } from "@/app/lib/agent-types";

type Row = Pick<AgentProfile, "id" | "name" | "phone" | "state" | "district" | "agent_type" | "created_at">;

export default function AgentApplicationsPage() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("agent_profiles")
      .select("id, name, phone, state, district, agent_type, created_at")
      .eq("verification_status", "pending_review")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [isAdmin]);

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
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Agent applications ({rows.length})</h1>
          <Link href="/admin/agents" className="text-sm text-green-700 hover:underline">All agents →</Link>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">No pending applications.</p>
        ) : (
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            {rows.map((a) => (
              <Link key={a.id} href={`/admin/agents/${a.id}`} className="flex flex-col gap-1 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-gray-600">
                    📞 {a.phone} · {[a.district, a.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">{agentTypeLabel(a.agent_type)}</span>
                  <span>{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
