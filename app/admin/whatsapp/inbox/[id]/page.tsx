"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import type { WhatsAppInboxRow } from "@/app/lib/agent-types";

type Row = WhatsAppInboxRow & { agent: { id: string; name: string } | null };

export default function InboxDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [row, setRow] = useState<Row | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isAdmin || !id) return;
    supabase
      .from("whatsapp_inbox")
      .select("*, agent:agent_profiles(id, name)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => (data ? setRow(data as Row) : setNotFound(true)));
  }, [isAdmin, id]);

  async function setStatus(processed_status: string) {
    await supabase.from("whatsapp_inbox").update({ processed_status }).eq("id", id);
    setRow((cur) => (cur ? { ...cur, processed_status: processed_status as Row["processed_status"] } : cur));
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
          <h1 className="mb-2 text-2xl font-bold">Message not found</h1>
          <Link href="/admin/whatsapp/inbox" className="text-green-700 hover:underline">Back to inbox</Link>
        </main>
      </div>
    );
  }
  if (!row) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading message…</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/admin/whatsapp/inbox" className="text-sm text-green-700 hover:underline">← Inbox</Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">Message from {row.agent?.name || "unknown sender"}</h1>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{row.processed_status.replace(/_/g, " ")}</span>
        </div>
        <p className="text-sm text-gray-500">
          {row.sender_phone} · {new Date(row.received_at).toLocaleString("en-IN")}
          {row.agent && <> · <Link href={`/admin/agents/${row.agent.id}`} className="text-green-700 hover:underline">view agent</Link></>}
        </p>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Message</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800">{row.raw_message}</p>
          {row.voice_transcript && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              <span className="font-medium">🎤 Voice transcript: </span>{row.voice_transcript}
            </div>
          )}
          {row.media_urls?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {row.media_urls.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noopener" className="text-xs text-green-700 hover:underline">📷 photo {i + 1}</a>
              ))}
            </div>
          )}
          {row.location_lat != null && row.location_lng != null && (
            <p className="mt-3 text-xs text-gray-500">📍 {row.location_lat}, {row.location_lng}</p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">Parse &amp; publish</h2>
          <p>Parsing status: <span className="font-medium text-gray-700">{row.parsing_status}</span>.</p>
          <p className="mt-1">AI parsing (turn this message into structured listing fields) and one-click publish to a live listing arrive in the next build slices.</p>
        </section>

        <div className="mt-5 flex flex-wrap gap-2">
          {row.processed_status !== "rejected" && <button onClick={() => setStatus("rejected")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Reject</button>}
          {row.processed_status !== "archived" && <button onClick={() => setStatus("archived")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Archive</button>}
          {(row.processed_status === "rejected" || row.processed_status === "archived") && <button onClick={() => setStatus("inbox")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Move back to inbox</button>}
        </div>
      </main>
    </div>
  );
}
