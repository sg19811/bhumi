"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth";
import AdminCoBuyOpportunityForm from "@/app/components/co-buy/AdminCoBuyOpportunityForm";

function NewOpportunityInner() {
  const { user, role, loading } = useAuth();
  const sp = useSearchParams();
  const listingId = sp.get("listing_id") ?? undefined;

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") {
    return <main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main>;
  }
  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / New opportunity</nav>
      <h1 className="mb-6 text-3xl font-bold">New opportunity</h1>
      <AdminCoBuyOpportunityForm listingId={listingId} />
    </main>
  );
}

export default function NewOpportunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>}>
        <NewOpportunityInner />
      </Suspense>
    </div>
  );
}
