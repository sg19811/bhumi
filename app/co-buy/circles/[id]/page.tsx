"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { CIRCLE_STATUS_LABELS, DOC_STATUS_DISPLAY, type DocStatus } from "@/app/lib/co-buy/circles/types";
import { docTypeLabel } from "@/app/lib/co-buy/circles/state-document-templates";
import { displayMemberName } from "@/app/lib/co-buy/circles/privacy";
import { submitRsvp } from "@/app/lib/co-buy/circles/circle-actions";
import { formatINRShort } from "@/app/lib/format";

type Row = Record<string, unknown> & { id: string };

export default function MemberCircle() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [circle, setCircle] = useState<Record<string, unknown> | null>(null);
  const [members, setMembers] = useState<Row[]>([]);
  const [milestones, setMilestones] = useState<Row[]>([]);
  const [docs, setDocs] = useState<Row[]>([]);
  const [visits, setVisits] = useState<Row[]>([]);
  const [events, setEvents] = useState<Row[]>([]);
  const [fetched, setFetched] = useState(false);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpMsg, setRsvpMsg] = useState("");

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const [c, m, ms, d, sv, ev] = await Promise.all([
        supabase.from("co_buy_circles").select("*").eq("id", id).maybeSingle(),
        supabase.from("co_buy_circle_members").select("id, display_name, identity_visibility, desired_share_label, user_id, member_status").eq("circle_id", id),
        supabase.from("co_buy_milestones").select("*").eq("circle_id", id).order("sort_order"),
        supabase.from("co_buy_documents").select("id, doc_type, status, buyer_visible_note").eq("circle_id", id),
        supabase.from("co_buy_site_visits").select("*").eq("circle_id", id).order("scheduled_date", { ascending: false }),
        supabase.from("co_buy_events").select("*").eq("circle_id", id).order("created_at", { ascending: false }).limit(20),
      ]);
      setCircle(c.data ?? null); setMembers((m.data as Row[]) ?? []); setMilestones((ms.data as Row[]) ?? []);
      setDocs((d.data as Row[]) ?? []); setVisits((sv.data as Row[]) ?? []); setEvents((ev.data as Row[]) ?? []);
      setFetched(true);
    })();
  }, [user, id]);

  const myMemberId = members.find((m) => m.user_id === user?.id)?.id as string | undefined;
  const nextVisit = visits.find((v) => v.status === "confirmed" || v.status === "proposed");

  async function rsvp(statusVal: string) {
    if (!nextVisit || !myMemberId) return;
    setRsvpBusy(true);
    const res = await submitRsvp(nextVisit.id, myMemberId, statusVal, 1);
    setRsvpBusy(false);
    setRsvpMsg(res.ok ? "✓ Your RSVP is saved." : (res.error ?? "Could not save RSVP."));
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) {
    return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Sign in to view your circle</h1><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;
  }
  if (fetched && !circle) {
    return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Circle not found</h1><p className="text-gray-500">You may not be a member of this circle.</p><Link href="/co-buy/circles" className="mt-4 inline-block text-green-700 hover:underline">← My circles</Link></main></div>;
  }

  const card = "mb-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/co-buy/circles" className="hover:text-green-800">My circles</Link> / {(circle?.name as string) ?? "…"}</nav>
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{CIRCLE_STATUS_LABELS[circle?.status as keyof typeof CIRCLE_STATUS_LABELS] ?? (circle?.status as string)}</span>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{circle?.name as string}</h1>
        {circle?.private_summary ? <p className="mt-2 text-gray-600">{circle.private_summary as string}</p> : <p className="mt-2 text-sm text-gray-500">We&apos;re progressing this circle. AcrehubIndia will contact you before each milestone.</p>}
        {circle?.whatsapp_group_link ? <a href={circle.whatsapp_group_link as string} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-sm font-medium text-white">💬 Join the WhatsApp group</a> : null}

        {/* Milestones */}
        <section className={`${card} mt-6`}>
          <h2 className="mb-3 font-semibold">Progress</h2>
          <ol className="space-y-2.5">
            {milestones.map((m) => {
              const done = m.status === "completed"; const active = m.status === "in_progress";
              return (
                <li key={m.id} className="flex items-start gap-3 text-sm">
                  <span aria-hidden="true" className={`mt-0.5 ${done ? "text-green-600" : active ? "text-amber-500" : "text-gray-300"}`}>{done ? "✓" : active ? "◉" : "○"}</span>
                  <span className={done ? "text-gray-500" : active ? "font-medium text-gray-900" : "text-gray-400"}>{m.title as string}</span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Site visit + RSVP */}
        {nextVisit && (
          <section className={card}>
            <h2 className="mb-2 font-semibold">Site visit</h2>
            <p className="text-sm text-gray-700">📅 {nextVisit.scheduled_date ? new Date(nextVisit.scheduled_date as string).toLocaleString("en-IN") : "Date to be confirmed"}{nextVisit.meeting_point ? ` · ${nextVisit.meeting_point}` : ""}</p>
            {myMemberId && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[["attending", "I'll attend"], ["maybe", "Maybe"], ["not_attending", "Can't make it"]].map(([v, l]) => (
                  <button key={v} onClick={() => rsvp(v)} disabled={rsvpBusy} className="rounded-full border border-green-700 px-4 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50 disabled:opacity-50">{l}</button>
                ))}
              </div>
            )}
            {rsvpMsg && <p className="mt-2 text-xs text-green-800">{rsvpMsg}</p>}
          </section>
        )}

        {/* Documents */}
        <section className={card}>
          <h2 className="mb-3 font-semibold">Document checklist</h2>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {docs.map((d) => (
              <div key={d.doc_type as string} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-700">{docTypeLabel(d.doc_type as string)}</span>
                <span className="shrink-0 text-gray-500">{DOC_STATUS_DISPLAY[(d.status as DocStatus) ?? "pending"]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">Status is AcrehubIndia&apos;s best-known status, not a legal record. Your lawyer&apos;s file is authoritative.</p>
        </section>

        {/* Members */}
        <section className={card}>
          <h2 className="mb-3 font-semibold">Members ({members.filter((m) => m.member_status === "active").length})</h2>
          <div className="flex flex-wrap gap-2">
            {members.filter((m) => m.member_status === "active").map((m) => (
              <span key={m.id} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700">{displayMemberName(m.display_name as string, m.identity_visibility as never)}</span>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">Names are shown per each member&apos;s privacy choice. Phone numbers are never shown here — use the WhatsApp group to coordinate.</p>
        </section>

        {/* Costs */}
        <section className={card}>
          <h2 className="mb-3 font-semibold">Indicative costs</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-gray-400">Target amount</dt><dd className="font-medium">{circle?.target_amount ? formatINRShort(circle.target_amount as number) : "—"}</dd></div>
            <div><dt className="text-xs text-gray-400">Soft commitment so far</dt><dd className="font-medium">{circle?.current_soft_commitment_amount ? formatINRShort(circle.current_soft_commitment_amount as number) : "—"}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gray-400">Indicative only. No money flows through this platform — the real split is set by lawyer-reviewed registered documents.</p>
        </section>

        {/* Activity */}
        {events.length > 0 && (
          <section className={card}>
            <h2 className="mb-3 font-semibold">Recent activity</h2>
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="text-sm text-gray-700">{e.title as string} <span className="text-xs text-gray-400">· {e.created_at ? new Date(e.created_at as string).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span></li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
