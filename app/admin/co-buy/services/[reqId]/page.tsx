"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { SERVICE_STATUS_LABELS, COST_COLUMNS, serviceCategoryLabel, vendorCategoryLabel } from "@/app/lib/co-buy/services/catalog";
import { recordApproval, postServiceUpdate, setServiceStatus } from "@/app/lib/co-buy/services/service-actions";
import { formatINRShort } from "@/app/lib/format";

const inp = "w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-green-600";
type Row = Record<string, unknown> & { id: string };

export default function AdminServiceDetail() {
  const { user, role, loading } = useAuth();
  const { reqId } = useParams<{ reqId: string }>();
  const [req, setReq] = useState<Record<string, unknown> | null>(null);
  const [vendors, setVendors] = useState<Row[]>([]);
  const [quotes, setQuotes] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [updates, setUpdates] = useState<Row[]>([]);
  const [fetched, setFetched] = useState(false);
  const [approval, setApproval] = useState("");
  const [q, setQ] = useState({ vendor_id: "", quote_title: "", quote_amount: "", buyer_visible: false });
  const [upd, setUpd] = useState({ title: "", body: "", visibility: "circle_members" });
  const [newTask, setNewTask] = useState("");

  async function reload() {
    const { data: r } = await supabase.from("co_buy_service_requests").select("*, co_buy_circles(name)").eq("id", reqId).maybeSingle();
    setReq(r ?? null);
    const [v, qs, t, u] = await Promise.all([
      supabase.from("acrehub_vendors").select("id, vendor_name, vendor_category").eq("active", true),
      supabase.from("co_buy_service_vendor_quotes").select("*").eq("service_request_id", reqId),
      supabase.from("co_buy_service_tasks").select("*").eq("service_request_id", reqId),
      supabase.from("co_buy_service_updates").select("*").eq("service_request_id", reqId).order("created_at", { ascending: false }),
    ]);
    setVendors((v.data as Row[]) ?? []); setQuotes((qs.data as Row[]) ?? []); setTasks((t.data as Row[]) ?? []); setUpdates((u.data as Row[]) ?? []);
    setFetched(true);
  }
  useEffect(() => {
    if (role !== "admin" || !reqId) return;
    (async () => { await reload(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, reqId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;
  if (fetched && !req) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><p className="text-gray-500">Service request not found.</p></main></div>;

  const circleId = req?.circle_id as string;
  const saveCost = async (patch: Record<string, unknown>) => { await supabase.from("co_buy_service_requests").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", reqId); setReq((c) => ({ ...(c ?? {}), ...patch })); };
  const addQuote = async () => { if (!q.quote_title || !q.quote_amount) return; const vn = vendors.find((v) => v.id === q.vendor_id); await supabase.from("co_buy_service_vendor_quotes").insert({ service_request_id: reqId, vendor_id: q.vendor_id || null, vendor_name_snapshot: vn?.vendor_name ?? null, quote_title: q.quote_title, quote_amount: Number(q.quote_amount), buyer_visible: q.buyer_visible }); setQ({ vendor_id: "", quote_title: "", quote_amount: "", buyer_visible: false }); reload(); };
  const selectQuote = async (quote: Row) => { await supabase.from("co_buy_service_vendor_quotes").update({ selected: true }).eq("id", quote.id); await saveCost({ vendor_cost_estimate: quote.quote_amount }); reload(); };
  const addTask = async () => { if (!newTask.trim()) return; await supabase.from("co_buy_service_tasks").insert({ service_request_id: reqId, title: newTask.trim(), status: "open" }); setNewTask(""); reload(); };
  const toggleTask = async (t: Row) => { const status = t.status === "done" ? "open" : "done"; await supabase.from("co_buy_service_tasks").update({ status }).eq("id", t.id); setTasks((xs) => xs.map((x) => x.id === t.id ? { ...x, status } : x)); };
  const postUpdate = async () => { if (!upd.title.trim()) return; await postServiceUpdate({ service_request_id: reqId, circle_id: circleId, title: upd.title.trim(), body: upd.body || null, visibility: upd.visibility as never }); setUpd({ title: "", body: "", visibility: "circle_members" }); reload(); };
  const approve = async () => { if (!approval.trim()) return; await recordApproval(reqId, circleId, approval.trim()); reload(); };

  const Sec = "mb-6 rounded-2xl border border-gray-200 bg-white p-5";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy/services" className="hover:text-green-800">Services</Link> / {(req?.title as string) ?? "…"}</nav>
        <h1 className="mb-1 text-3xl font-bold">{req?.title as string}</h1>
        <p className="mb-4 text-sm text-gray-500">{serviceCategoryLabel(req?.service_category as string)} · {(req?.co_buy_circles as { name?: string })?.name ?? ""}</p>

        <section className={Sec}>
          <label className="text-sm">Status<select value={req?.status as string} onChange={(e) => { setServiceStatus(reqId, circleId, e.target.value); setReq((c) => ({ ...(c ?? {}), status: e.target.value })); }} className={`mt-1 ${inp}`}>{Object.entries(SERVICE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Cost estimate (three columns)</h2>
          <div className="space-y-3">
            {COST_COLUMNS.map((c) => (
              <label key={c.key} className="block text-sm"><span className="font-medium text-gray-700">{c.label} (₹)</span><span className="mb-1 block text-xs text-gray-500">{c.explainer}</span><input defaultValue={(req?.[c.key] as number)?.toString() ?? ""} onBlur={(e) => saveCost({ [c.key]: Number(e.target.value) || 0 })} type="number" className={inp} /></label>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium">Estimated total: {req?.estimated_total_cost ? formatINRShort(req.estimated_total_cost as number) : "—"} <span className="text-xs font-normal text-gray-400">(always shown broken out to members)</span></p>
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Quotes</h2>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select value={q.vendor_id} onChange={(e) => setQ({ ...q, vendor_id: e.target.value })} className={inp}><option value="">Vendor (optional)</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.vendor_name as string} · {vendorCategoryLabel(v.vendor_category as string)}</option>)}</select>
            <input value={q.quote_title} onChange={(e) => setQ({ ...q, quote_title: e.target.value })} placeholder="Quote title" className={inp} />
            <input value={q.quote_amount} onChange={(e) => setQ({ ...q, quote_amount: e.target.value })} type="number" placeholder="Amount ₹" className={inp} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={q.buyer_visible} onChange={(e) => setQ({ ...q, buyer_visible: e.target.checked })} className="h-4 w-4 accent-green-700" />Show to members</label>
          </div>
          <button onClick={addQuote} className="mb-3 rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">Add quote</button>
          {quotes.map((qt) => (
            <div key={qt.id} className="flex items-center justify-between gap-2 border-b border-gray-100 py-2 text-sm">
              <span>{qt.quote_title as string} · {formatINRShort(qt.quote_amount as number)}{qt.buyer_visible ? " · 👁 visible" : ""}{qt.selected ? " · ✓ selected" : ""}</span>
              {!qt.selected && <button onClick={() => selectQuote(qt)} className="text-xs font-medium text-green-800 hover:underline">Select</button>}
            </div>
          ))}
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Buyer approval</h2>
          <p className="mb-2 text-xs text-gray-500">Record the circle&apos;s consensus (decided in WhatsApp). e.g. &ldquo;Approved by 7 of 10 members on 12 Mar 2026&rdquo;.</p>
          <textarea value={approval} onChange={(e) => setApproval(e.target.value)} rows={2} placeholder={(req?.approved_by_summary as string) ?? "Approval summary"} className={inp} />
          <button onClick={approve} className="mt-2 rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">Mark approved</button>
          {req?.approved_by_summary ? <p className="mt-2 text-xs text-green-800">✓ {req.approved_by_summary as string}</p> : null}
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Post update</h2>
          <input value={upd.title} onChange={(e) => setUpd({ ...upd, title: e.target.value })} placeholder="Update title" className={`mb-2 ${inp}`} />
          <textarea value={upd.body} onChange={(e) => setUpd({ ...upd, body: e.target.value })} rows={2} placeholder="Details" className={`mb-2 ${inp}`} />
          <div className="mb-2 flex gap-3 text-sm">
            {[["internal_only", "Internal"], ["circle_members", "Members"], ["public_summary", "Public"]].map(([v, l]) => (
              <label key={v} className="flex items-center gap-1.5"><input type="radio" name="vis" checked={upd.visibility === v} onChange={() => setUpd({ ...upd, visibility: v })} />{l}</label>
            ))}
          </div>
          <button onClick={postUpdate} className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">Post update</button>
          <div className="mt-3 space-y-1.5">
            {updates.map((u) => <p key={u.id} className="text-sm text-gray-600">{u.title as string} <span className="text-xs text-gray-400">· {u.visibility as string}</span></p>)}
          </div>
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Tasks</h2>
          <div className="mb-2 flex gap-2"><input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task…" className={inp} /><button onClick={addTask} className="shrink-0 rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">Add</button></div>
          {tasks.map((t) => <label key={t.id} className="flex items-center gap-2 border-b border-gray-100 py-2 text-sm"><input type="checkbox" checked={t.status === "done"} onChange={() => toggleTask(t)} className="h-4 w-4 accent-green-700" /><span className={t.status === "done" ? "text-gray-400 line-through" : ""}>{t.title as string}</span></label>)}
        </section>
      </main>
    </div>
  );
}
