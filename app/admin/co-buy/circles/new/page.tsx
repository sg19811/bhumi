"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { createCircle } from "@/app/lib/co-buy/circles/circle-actions";
import { coBuySlug } from "@/app/lib/co-buy/slug";
import { districtToState } from "@/app/lib/legal/districts";

const field = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

function NewCircleInner() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const opportunityId = sp.get("opportunity_id") ?? "";
  const interestId = sp.get("interest_id") ?? "";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [targetMembers, setTargetMembers] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [firstMember, setFirstMember] = useState<{ interest_id: string; display_name: string; desired_share_label: string | null; soft_commitment_amount: number | null; user_id: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin" || !opportunityId) return;
    (async () => {
      const { data: opp } = await supabase.from("co_buy_opportunities").select("title, target_members, listing_id").eq("id", opportunityId).maybeSingle();
      if (opp) {
        setName(`${opp.title} Circle`);
        setSlug(coBuySlug(`${opp.title}-circle`));
        if (opp.target_members) setTargetMembers(String(opp.target_members));
        const { data: listing } = await supabase.from("listings").select("district").eq("id", opp.listing_id).maybeSingle();
        if (listing?.district) setState(districtToState(listing.district));
      }
      if (interestId) {
        const { data: it } = await supabase.from("co_buy_interests").select("name, user_id, desired_share_label, desired_contribution, city").eq("id", interestId).maybeSingle();
        if (it) setFirstMember({ interest_id: interestId, display_name: it.city ? `${it.name}, ${it.city}` : it.name, desired_share_label: it.desired_share_label, soft_commitment_amount: it.desired_contribution, user_id: it.user_id });
      }
    })();
  }, [role, opportunityId, interestId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main>;

  async function save() {
    if (!opportunityId) { setError("Missing opportunity. Open this from a lead or an opportunity."); return; }
    if (!name.trim()) { setError("Circle name is required."); return; }
    setBusy(true); setError("");
    const res = await createCircle({
      opportunity_id: opportunityId, name: name.trim(), slug: slug.trim() || coBuySlug(name),
      state, target_members: targetMembers ? Number(targetMembers) : null, target_amount: targetAmount ? Number(targetAmount) : null,
      firstMember: firstMember ?? undefined,
    });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Could not create circle."); return; }
    router.push(`/admin/co-buy/circles/${res.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy/circles" className="hover:text-green-800">Circles</Link> / New</nav>
      <h1 className="mb-2 text-3xl font-bold">New circle</h1>
      <p className="mb-6 text-sm text-gray-500">Creating a circle auto-seeds the milestone path and the {state ? `${state} ` : ""}document checklist.{firstMember ? " The selected lead is added as the first member." : ""}</p>
      {!opportunityId && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Open this from a lead&apos;s &ldquo;Add to circle&rdquo; action so it links to an opportunity.</p>}
      <div className="space-y-4">
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Circle name *</span><input value={name} onChange={(e) => setName(e.target.value)} className={field} /></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Slug</span><input value={slug} onChange={(e) => setSlug(e.target.value)} className={field} /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Target members</span><input value={targetMembers} onChange={(e) => setTargetMembers(e.target.value)} type="number" className={field} /></label>
          <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Target amount (₹)</span><input value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} type="number" className={field} /></label>
        </div>
        {firstMember && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">First member: <strong>{firstMember.display_name}</strong></p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={save} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Creating…" : "Create circle"}</button>
      </div>
    </main>
  );
}

export default function NewCirclePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>}><NewCircleInner /></Suspense>
    </div>
  );
}
