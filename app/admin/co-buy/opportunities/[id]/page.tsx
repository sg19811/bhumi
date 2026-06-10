"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import AdminCoBuyOpportunityForm from "@/app/components/co-buy/AdminCoBuyOpportunityForm";
import type { CoBuyOpportunity } from "@/app/lib/co-buy/types";

export default function EditOpportunityPage() {
  const { user, role, loading } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [opp, setOpp] = useState<CoBuyOpportunity | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (role !== "admin" || !id) return;
    (async () => {
      const { data } = await supabase.from("co_buy_opportunities").select("*").eq("id", id).maybeSingle();
      setOpp((data as CoBuyOpportunity) ?? null);
      setFetched(true);
    })();
  }, [role, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") {
    return (
      <div className="min-h-screen bg-white text-gray-900"><Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / Edit</nav>
        <h1 className="mb-6 text-3xl font-bold">Edit opportunity</h1>
        {!fetched ? <p className="text-gray-400">Loading…</p> : opp ? <AdminCoBuyOpportunityForm existing={opp} /> : <p className="text-gray-500">Opportunity not found.</p>}
      </main>
    </div>
  );
}
