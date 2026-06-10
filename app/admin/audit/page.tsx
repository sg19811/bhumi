"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

export default function AdminAudit() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [entity, setEntity] = useState("all");

  useEffect(() => { if (isAdmin) supabase.from("acrehub_audit_log").select("*").order("created_at", { ascending: false }).limit(500).then(({ data }) => setRows(data ?? [])); }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  const entities = ["all", ...Array.from(new Set(rows.map((r) => r.entity_type as string)))];
  const shown = entity === "all" ? rows : rows.filter((r) => r.entity_type === entity);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900"><Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold">Audit log</h1>
        <p className="mb-4 text-sm text-gray-500">Sensitive admin actions across Buying Circles.</p>
        <div className="mb-4 flex flex-wrap gap-2">{entities.map((e) => <button key={e} onClick={() => setEntity(e)} className={`rounded-full px-3 py-1.5 text-xs ${entity === e ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-700"}`}>{e}</button>)}</div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-3">When</th><th className="p-3">Entity</th><th className="p-3">Action</th><th className="p-3">Notes</th></tr></thead>
          <tbody>{shown.map((r) => <tr key={r.id as string} className="border-b border-gray-100"><td className="p-3 text-gray-500">{r.created_at ? new Date(r.created_at as string).toLocaleString("en-IN") : ""}</td><td className="p-3">{r.entity_type as string}</td><td className="p-3">{r.action as string}</td><td className="p-3 text-gray-600">{(r.notes as string) ?? ""}</td></tr>)}
          {shown.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">No audit entries yet.</td></tr>}</tbody></table>
        </div>
      </main>
    </div>
  );
}
