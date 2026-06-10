"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { SERVICE_CATEGORIES } from "@/app/lib/co-buy/services/catalog";

const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

export default function MemberServiceRequest() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [category, setCategory] = useState("co_buy_coordination");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("co_buy_circle_members").select("id").eq("circle_id", id).eq("user_id", user.id).maybeSingle().then(({ data }) => setMemberId((data?.id as string) ?? null));
  }, [user, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;

  async function submit() {
    if (!title.trim()) { setError("A short title helps us understand the request."); return; }
    setBusy(true); setError("");
    const { error: e } = await supabase.from("co_buy_service_requests").insert({
      circle_id: id, service_category: category, title: title.trim(), description: description || null,
      status: "requested", initiator_type: "member", requesting_member_id: memberId,
    });
    setBusy(false);
    if (e) { setError(e.message); return; }
    router.push(`/co-buy/circles/${id}/services`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900"><Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}/services`} className="hover:text-green-800">Services</Link> / Request</nav>
        <h1 className="text-3xl font-bold">Request a service</h1>
        <p className="mt-2 text-sm text-gray-500">This is a request, not a commitment. AcrehubIndia will review it, develop a scope and costs, and bring it back to the circle for approval.</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Service type</span><select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>{SERVICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">What do you need?</span><input value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Details (optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={field} /></label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Submitting…" : "Submit request"}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
