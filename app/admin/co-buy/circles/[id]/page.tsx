"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { CIRCLE_STATUS_LABELS } from "@/app/lib/co-buy/circles/types";
import { docTypeLabel } from "@/app/lib/co-buy/circles/state-document-templates";
import { logCircleEvent } from "@/app/lib/co-buy/circles/circle-actions";

const DOC_STATES = ["pending", "in_review", "received", "verified", "flagged", "not_required"];
const MS_STATES = ["pending", "in_progress", "completed", "skipped", "blocked"];
const inp = "w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-green-600";
type Row = Record<string, unknown> & { id: string };

export default function AdminCircleDetail() {
  const { user, role, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [circle, setCircle] = useState<Record<string, unknown> | null>(null);
  const [members, setMembers] = useState<Row[]>([]);
  const [docs, setDocs] = useState<Row[]>([]);
  const [milestones, setMilestones] = useState<Row[]>([]);
  const [visits, setVisits] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [fetched, setFetched] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitPoint, setVisitPoint] = useState("");

  async function reload() {
    const [c, m, d, ms, sv, t] = await Promise.all([
      supabase.from("co_buy_circles").select("*").eq("id", id).maybeSingle(),
      supabase.from("co_buy_circle_members").select("*").eq("circle_id", id).order("created_at"),
      supabase.from("co_buy_documents").select("*").eq("circle_id", id),
      supabase.from("co_buy_milestones").select("*").eq("circle_id", id).order("sort_order"),
      supabase.from("co_buy_site_visits").select("*").eq("circle_id", id).order("created_at", { ascending: false }),
      supabase.from("co_buy_tasks").select("*").eq("circle_id", id).order("created_at", { ascending: false }),
    ]);
    setCircle(c.data ?? null); setMembers((m.data as Row[]) ?? []); setDocs((d.data as Row[]) ?? []);
    setMilestones((ms.data as Row[]) ?? []); setVisits((sv.data as Row[]) ?? []); setTasks((t.data as Row[]) ?? []);
    setFetched(true);
  }
  useEffect(() => {
    if (role !== "admin" || !id) return;
    (async () => { await reload(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, id]);

  const [exits, setExits] = useState<Row[]>([]);
  const [pp, setPp] = useState({ reg: "", amt: "" });
  useEffect(() => {
    if (role !== "admin" || !id) return;
    supabase.from("co_buy_exit_interests").select("*").eq("circle_id", id).then(({ data }) => setExits((data as Row[]) ?? []));
  }, [role, id]);
  const moveToPostPurchase = async () => {
    await saveCircle({ status: "completed", post_purchase_at: new Date().toISOString(), registration_date: pp.reg || null, final_purchase_amount: pp.amt ? Number(pp.amt) : null });
  };
  const setExitStatus = async (e: Row, status: string) => { await supabase.from("co_buy_exit_interests").update({ status }).eq("id", e.id); setExits((xs) => xs.map((x) => x.id === e.id ? { ...x, status } : x)); };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;
  if (fetched && !circle) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><p className="text-gray-500">Circle not found.</p></main></div>;

  const saveCircle = async (patch: Record<string, unknown>) => { await supabase.from("co_buy_circles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id); setCircle((c) => ({ ...(c ?? {}), ...patch })); };
  const setDocStatus = async (doc: Row, status: string) => { await supabase.from("co_buy_documents").update({ status, updated_at: new Date().toISOString() }).eq("id", doc.id); setDocs((ds) => ds.map((x) => x.id === doc.id ? { ...x, status } : x)); logCircleEvent(id, { event_type: "document_received", title: `Document updated: ${docTypeLabel(doc.doc_type as string)} → ${status}` }); };
  const setMsStatus = async (m: Row, status: string) => { await supabase.from("co_buy_milestones").update({ status, completed_at: status === "completed" ? new Date().toISOString() : null }).eq("id", m.id); setMilestones((xs) => xs.map((x) => x.id === m.id ? { ...x, status } : x)); if (status === "completed") logCircleEvent(id, { event_type: "milestone_completed", title: `Milestone completed: ${m.title}` }); };
  const setMemberStatus = async (mem: Row, member_status: string) => { await supabase.from("co_buy_circle_members").update({ member_status }).eq("id", mem.id); setMembers((xs) => xs.map((x) => x.id === mem.id ? { ...x, member_status } : x)); };
  const addTask = async () => { if (!newTask.trim()) return; await supabase.from("co_buy_tasks").insert({ circle_id: id, title: newTask.trim(), status: "open" }); setNewTask(""); reload(); };
  const toggleTask = async (t: Row) => { const status = t.status === "done" ? "open" : "done"; await supabase.from("co_buy_tasks").update({ status, completed_at: status === "done" ? new Date().toISOString() : null }).eq("id", t.id); setTasks((xs) => xs.map((x) => x.id === t.id ? { ...x, status } : x)); };
  const scheduleVisit = async () => { if (!visitDate) return; await supabase.from("co_buy_site_visits").insert({ circle_id: id, scheduled_date: new Date(visitDate).toISOString(), meeting_point: visitPoint || null, status: "confirmed" }); logCircleEvent(id, { event_type: "site_visit_scheduled", title: `Site visit scheduled for ${visitDate}` }); setVisitDate(""); setVisitPoint(""); reload(); };

  const Section = "mb-8 rounded-2xl border border-gray-200 bg-white p-5";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy/circles" className="hover:text-green-800">Circles</Link> / {(circle?.name as string) ?? "…"}</nav>
        <h1 className="mb-1 text-3xl font-bold">{circle?.name as string}</h1>
        <p className="mb-3 text-sm text-gray-500">Status: {CIRCLE_STATUS_LABELS[circle?.status as keyof typeof CIRCLE_STATUS_LABELS] ?? (circle?.status as string)}</p>
        <Link href={`/admin/co-buy/services/new?circle_id=${id}`} className="mb-6 inline-flex rounded-full border border-green-700 px-4 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50">+ Add service request</Link>

        {/* Circle settings */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Circle settings</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">Status<select value={circle?.status as string} onChange={(e) => saveCircle({ status: e.target.value })} className={`mt-1 ${inp}`}>{Object.entries(CIRCLE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="text-sm">Lawyer name<input defaultValue={(circle?.lawyer_name as string) ?? ""} onBlur={(e) => saveCircle({ lawyer_name: e.target.value || null })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm">WhatsApp group link<input defaultValue={(circle?.whatsapp_group_link as string) ?? ""} onBlur={(e) => saveCircle({ whatsapp_group_link: e.target.value || null })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm">Lawyer status<select defaultValue={(circle?.lawyer_status as string) ?? "not_assigned"} onChange={(e) => saveCircle({ lawyer_status: e.target.value })} className={`mt-1 ${inp}`}><option value="not_assigned">Not assigned</option><option value="engaged">Engaged</option><option value="review_in_progress">Review in progress</option><option value="review_complete">Review complete</option></select></label>
          </div>
          <label className="mt-3 block text-sm">Member-visible summary<textarea defaultValue={(circle?.private_summary as string) ?? ""} onBlur={(e) => saveCircle({ private_summary: e.target.value || null })} rows={2} className={`mt-1 ${inp}`} /></label>
          <label className="mt-3 block text-sm">Admin notes (internal)<textarea defaultValue={(circle?.admin_notes as string) ?? ""} onBlur={(e) => saveCircle({ admin_notes: e.target.value || null })} rows={2} className={`mt-1 ${inp}`} /></label>
        </section>

        {/* Post-purchase */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Post-purchase</h2>
          {circle?.post_purchase_at ? (
            <div>
              <p className="text-sm text-green-800">✓ Post-purchase active{circle.registration_date ? ` · registered ${circle.registration_date as string}` : ""}.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/admin/co-buy/circles/${id}/expenses`} className="rounded-full border border-green-700 px-4 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50">Expenses</Link>
                <Link href={`/admin/co-buy/circles/${id}/proposals`} className="rounded-full border border-green-700 px-4 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50">Proposals</Link>
              </div>
              {exits.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-medium text-gray-700">Exit interests</p>
                  {exits.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-2 border-b border-gray-100 py-1.5 text-sm"><span>{e.exit_type as string} · {(e.status as string)}</span><select value={e.status as string} onChange={(ev) => setExitStatus(e, ev.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">{["registered", "lawyer_engaged", "buyer_identified", "in_negotiation", "completed", "withdrawn"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm text-gray-500">Once registration is complete, move this circle to ongoing stewardship.</p>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm">Registration date<input type="date" value={pp.reg} onChange={(e) => setPp({ ...pp, reg: e.target.value })} className={`mt-1 ${inp}`} /></label>
                <label className="text-sm">Final amount (₹)<input type="number" value={pp.amt} onChange={(e) => setPp({ ...pp, amt: e.target.value })} className={`mt-1 ${inp}`} /></label>
                <button onClick={moveToPostPurchase} className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">Move to post-purchase</button>
              </div>
            </div>
          )}
        </section>

        {/* Members */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 text-sm">
                <span className="font-medium">{m.display_name as string} <span className="text-gray-400">· {(m.desired_share_label as string) ?? "—"}</span></span>
                <select value={m.member_status as string} onChange={(e) => setMemberStatus(m, e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">{["invited", "active", "paused", "withdrawn", "removed"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-gray-400">No members yet. Add qualified leads from the Leads page.</p>}
          </div>
        </section>

        {/* Documents */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Documents ({docs.length})</h2>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 text-sm">
                <span>{docTypeLabel(d.doc_type as string)}</span>
                <select value={d.status as string} onChange={(e) => setDocStatus(d, e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">{DOC_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            ))}
            {docs.length === 0 && <p className="text-sm text-gray-400">No documents seeded.</p>}
          </div>
        </section>

        {/* Milestones */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Milestones</h2>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 text-sm">
                <span>{m.title as string}</span>
                <select value={m.status as string} onChange={(e) => setMsStatus(m, e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">{MS_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            ))}
          </div>
        </section>

        {/* Site visits */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Site visits</h2>
          <div className="mb-3 flex flex-wrap items-end gap-2">
            <label className="text-sm">Date<input type="datetime-local" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm">Meeting point<input value={visitPoint} onChange={(e) => setVisitPoint(e.target.value)} className={`mt-1 ${inp}`} /></label>
            <button onClick={scheduleVisit} className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">Schedule</button>
          </div>
          {visits.map((v) => (
            <div key={v.id} className="border-b border-gray-100 py-2 text-sm">📅 {v.scheduled_date ? new Date(v.scheduled_date as string).toLocaleString("en-IN") : "TBD"} · {(v.meeting_point as string) ?? "—"} · <span className="text-gray-500">{v.status as string}</span></div>
          ))}
          {visits.length === 0 && <p className="text-sm text-gray-400">No site visits scheduled.</p>}
        </section>

        {/* Tasks */}
        <section className={Section}>
          <h2 className="mb-3 font-semibold">Tasks</h2>
          <div className="mb-3 flex gap-2">
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task…" className={inp} />
            <button onClick={addTask} className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">Add</button>
          </div>
          {tasks.map((t) => (
            <label key={t.id} className="flex items-center gap-2 border-b border-gray-100 py-2 text-sm">
              <input type="checkbox" checked={t.status === "done"} onChange={() => toggleTask(t)} className="h-4 w-4 accent-green-700" />
              <span className={t.status === "done" ? "text-gray-400 line-through" : ""}>{t.title as string}</span>
            </label>
          ))}
          {tasks.length === 0 && <p className="text-sm text-gray-400">No tasks.</p>}
        </section>
      </main>
    </div>
  );
}
