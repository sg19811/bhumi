"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import InboxList, { type InboxRowWithAgent } from "@/app/components/admin/whatsapp/InboxList";
import type { ProcessedStatus } from "@/app/lib/agent-types";

const STATUS_OPTIONS: Array<ProcessedStatus | "all"> = [
  "all", "inbox", "awaiting_clarification", "in_progress", "listing_drafted", "published", "rejected", "duplicate_merged", "archived",
];

export default function InboxPage() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<InboxRowWithAgent[]>([]);
  const [status, setStatus] = useState<ProcessedStatus | "all">("inbox");

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("whatsapp_inbox")
      .select("*, agent:agent_profiles(name)")
      .order("received_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const mapped = (data ?? []).map((r: Record<string, unknown>) => ({
          ...r,
          agent_name: (r.agent as { name: string } | null)?.name ?? null,
        })) as InboxRowWithAgent[];
        setRows(mapped);
      });
  }, [isAdmin]);

  const filtered = useMemo(
    () => (status === "all" ? rows : rows.filter((r) => r.processed_status === status)),
    [rows, status]
  );

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">WhatsApp inbox</h1>
          <Link href="/admin/whatsapp/inbox/new" className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">+ Add message</Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === s ? "bg-green-700 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <InboxList rows={filtered} />
      </main>
    </div>
  );
}
