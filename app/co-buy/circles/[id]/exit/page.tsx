"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { registerExit } from "@/app/lib/co-buy/post-purchase/actions";
import { EXIT_TYPES, POST_PURCHASE_DISCLAIMERS } from "@/app/lib/co-buy/post-purchase/constants";

const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

export default function MemberExit() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [exitType, setExitType] = useState(EXIT_TYPES[0].key);
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("flexible");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (user && id) supabase.from("co_buy_circle_members").select("id").eq("circle_id", id).eq("user_id", user.id).maybeSingle().then(({ data }) => setMemberId((data?.id as string) ?? null)); }, [user, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;

  async function submit() {
    if (!memberId) { setMsg("We couldn't find your membership for this circle."); return; }
    setBusy(true); setMsg("");
    const res = await registerExit({ circle_id: id, member_id: memberId, exit_type: exitType, expected_price: price ? Number(price) : null, preferred_timeline: timeline, reason: reason || null });
    setBusy(false);
    if (!res.ok) { setMsg(res.error ?? "Could not register."); return; }
    router.push(`/co-buy/circles/${id}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900"><Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}`} className="hover:text-green-800">Circle</Link> / Exit</nav>
        <h1 className="text-3xl font-bold">Register exit interest</h1>
        <p className="mt-2 text-sm text-gray-500">{POST_PURCHASE_DISCLAIMERS.exitIsIntent}</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Exit type</span><select value={exitType} onChange={(e) => setExitType(e.target.value)} className={field}>{EXIT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Expected price (₹, optional)</span><input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className={field} /></label>
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Timeline</span><select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={field}><option value="immediate">Immediate</option><option value="3_months">Within 3 months</option><option value="6_months">Within 6 months</option><option value="1_year">Within a year</option><option value="flexible">Flexible</option></select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Reason (optional)</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={field} /></label>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button onClick={submit} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Submitting…" : "Register interest"}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
