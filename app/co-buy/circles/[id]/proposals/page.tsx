"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { POST_PURCHASE_DISCLAIMERS } from "@/app/lib/co-buy/post-purchase/constants";

export default function MemberProposals() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [proposals, setProposals] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { if (user && id) supabase.from("co_buy_proposals").select("id, title, status, proposal_type, voting_ends_at").eq("circle_id", id).order("created_at", { ascending: false }).then(({ data }) => setProposals(data ?? [])); }, [user, id]);
  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900"><Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}`} className="hover:text-green-800">Circle</Link> / Proposals</nav>
        <h1 className="text-3xl font-bold sm:text-4xl">Decisions &amp; proposals</h1>
        <p className="mt-2 text-xs text-gray-400">{POST_PURCHASE_DISCLAIMERS.advisoryVote}</p>
        <div className="mt-6 space-y-3">
          {proposals.map((p) => (
            <Link key={p.id as string} href={`/co-buy/circles/${id}/proposals/${p.id}`} className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-green-300">
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{p.status as string}</span>
              <h2 className="mt-2 font-semibold text-green-900">{p.title as string}</h2>
            </Link>
          ))}
          {proposals.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-400">No proposals yet.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
