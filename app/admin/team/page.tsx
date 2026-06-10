"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

const TEAM_ROLES = ["sales_member", "build_member", "legal_revenue_member", "finance_member", "viewer"];
const field = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

export default function AdminTeam() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [roles, setRoles] = useState<Record<string, unknown>[]>([]);
  const [userId, setUserId] = useState("");
  const [teamRole, setTeamRole] = useState("sales_member");
  const [msg, setMsg] = useState("");

  async function reload() { const { data } = await supabase.from("acrehub_team_roles").select("*").order("created_at", { ascending: false }); setRoles(data ?? []); }
  useEffect(() => {
    if (!isAdmin) return;
    (async () => { await reload(); })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  async function grant() {
    if (!userId.trim()) { setMsg("Enter the user's UUID (from Supabase Auth)."); return; }
    const { error } = await supabase.from("acrehub_team_roles").insert({ user_id: userId.trim(), team_role: teamRole, granted_by: user!.id });
    setMsg(error ? error.message : "✓ Role granted."); if (!error) { setUserId(""); reload(); }
  }
  async function toggle(r: Record<string, unknown>) { await supabase.from("acrehub_team_roles").update({ active: !(r.active !== false) }).eq("id", r.id as string); reload(); }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900"><Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold">Team roles</h1>
        <p className="mb-6 text-sm text-gray-500">Grant finer-grained team roles. (Full admin is still set via <code>profiles.role</code>.)</p>
        <div className="mb-6 flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white p-4">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User UUID" className={`${field} flex-1`} />
          <select value={teamRole} onChange={(e) => setTeamRole(e.target.value)} className={field}>{TEAM_ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}</select>
          <button onClick={grant} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">Grant</button>
          {msg && <span className="w-full text-xs text-gray-500">{msg}</span>}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Active</th><th className="p-3"></th></tr></thead>
          <tbody>{roles.map((r) => <tr key={r.id as string} className="border-b border-gray-100"><td className="p-3 font-mono text-xs">{String(r.user_id).slice(0, 12)}…</td><td className="p-3">{String(r.team_role).replace(/_/g, " ")}</td><td className="p-3">{r.active !== false ? "Yes" : "No"}</td><td className="p-3 text-right"><button onClick={() => toggle(r)} className="text-xs font-medium text-green-800 hover:underline">{r.active !== false ? "Revoke" : "Reactivate"}</button></td></tr>)}
          {roles.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">No team roles granted yet.</td></tr>}</tbody></table>
        </div>
      </main>
    </div>
  );
}
