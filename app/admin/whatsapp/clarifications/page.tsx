"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

type Row = {
  id: string;
  sender_phone: string;
  raw_message: string;
  clarification_sent_at: string | null;
  clarification_questions: string[] | null;
  agent: { name: string } | null;
};

const hoursSince = (iso: string | null) => (iso ? (Date.now() - new Date(iso).getTime()) / 3600000 : 0);

export default function ClarificationsPage() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("whatsapp_inbox")
      .select("id, sender_phone, raw_message, clarification_sent_at, clarification_questions, agent:agent_profiles(name)")
      .eq("processed_status", "awaiting_clarification")
      .order("clarification_sent_at", { ascending: true })
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]));
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Awaiting clarification ({rows.length})</h1>
          <Link href="/admin/whatsapp/inbox" className="text-sm text-green-700 hover:underline">← Inbox</Link>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Nothing waiting on a reply.</p>
        ) : (
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            {rows.map((r) => {
              const overdue = hoursSince(r.clarification_sent_at) > 48;
              return (
                <Link key={r.id} href={`/admin/whatsapp/inbox/${r.id}`} className="block p-4 hover:bg-gray-50">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {r.agent?.name || r.sender_phone}
                    {overdue && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">overdue</span>}
                    {r.clarification_sent_at && <span className="text-xs font-normal text-gray-400">sent {new Date(r.clarification_sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-600">{r.raw_message}</p>
                  {r.clarification_questions?.length ? (
                    <p className="mt-1 text-xs text-gray-500">Asked: {r.clarification_questions.join(" · ")}</p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
