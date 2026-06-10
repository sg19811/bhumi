"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { createExpense } from "@/app/lib/co-buy/post-purchase/actions";
import { EXPENSE_CATEGORIES, expenseCategoryLabel } from "@/app/lib/co-buy/post-purchase/constants";
import type { AllocMethod } from "@/app/lib/co-buy/post-purchase/allocation";
import { formatINR } from "@/app/lib/format";

const inp = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";
type Row = Record<string, unknown> & { id: string };

export default function AdminExpenses() {
  const { user, role, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [f, setF] = useState({ category: "maintenance", title: "", amount: "", expense_date: "", allocation_method: "equal" as AllocMethod });
  const [specific, setSpecific] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function reload() {
    const [m, e] = await Promise.all([
      supabase.from("co_buy_circle_members").select("id, display_name, soft_commitment_amount, member_status").eq("circle_id", id).eq("member_status", "active"),
      supabase.from("co_buy_expenses").select("*").eq("circle_id", id).order("expense_date", { ascending: false }),
    ]);
    setMembers((m.data as Row[]) ?? []); setExpenses((e.data as Row[]) ?? []);
  }
  useEffect(() => {
    if (role !== "admin" || !id) return;
    (async () => { await reload(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  async function add() {
    if (!f.title.trim() || !f.amount || !f.expense_date) { setMsg("Title, amount, and date are required."); return; }
    setBusy(true); setMsg("");
    const res = await createExpense(
      { circle_id: id, category: f.category, title: f.title.trim(), amount: Number(f.amount), expense_date: f.expense_date, allocation_method: f.allocation_method, memberIds: f.allocation_method === "specific_members" ? specific : undefined },
      members.map((m) => ({ id: m.id, soft_commitment_amount: (m.soft_commitment_amount as number) ?? 0 }))
    );
    setBusy(false);
    if (!res.ok) { setMsg(res.error ?? "Failed."); return; }
    setF({ category: "maintenance", title: "", amount: "", expense_date: "", allocation_method: "equal" }); setSpecific([]); reload();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900"><Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/admin/co-buy/circles/${id}`} className="hover:text-green-800">Circle</Link> / Expenses</nav>
        <h1 className="mb-4 text-3xl font-bold">Expenses &amp; allocation</h1>
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inp}>{EXPENSE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
            <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" className={inp} />
            <input value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} type="number" placeholder="Amount ₹" className={inp} />
            <input value={f.expense_date} onChange={(e) => setF({ ...f, expense_date: e.target.value })} type="date" className={inp} />
            <select value={f.allocation_method} onChange={(e) => setF({ ...f, allocation_method: e.target.value as AllocMethod })} className={inp}><option value="equal">Split equally</option><option value="by_share">By share</option><option value="specific_members">Specific members</option></select>
          </div>
          {f.allocation_method === "specific_members" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {members.map((m) => (
                <label key={m.id} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={specific.includes(m.id)} onChange={() => setSpecific((s) => s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id])} className="h-4 w-4 accent-green-700" />{m.display_name as string}</label>
              ))}
            </div>
          )}
          <button onClick={add} disabled={busy} className="mt-3 rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : "Record expense"}</button>
          {msg && <p className="mt-2 text-xs text-gray-500">{msg}</p>}
        </div>
        <div className="space-y-2">
          {expenses.map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 text-sm"><div><p className="font-medium">{x.title as string}</p><p className="text-xs text-gray-400">{expenseCategoryLabel(x.category as string)} · {x.expense_date as string} · {x.allocation_method as string}</p></div><p className="font-semibold">{formatINR(x.amount as number)}</p></div>
          ))}
          {expenses.length === 0 && <p className="text-sm text-gray-400">No expenses yet.</p>}
        </div>
      </main>
    </div>
  );
}
