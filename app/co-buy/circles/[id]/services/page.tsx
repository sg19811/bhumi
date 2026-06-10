"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { SERVICE_STATUS_LABELS, serviceCategoryLabel } from "@/app/lib/co-buy/services/catalog";

export default function MemberServices() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [reqs, setReqs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("co_buy_service_requests").select("id, title, service_category, status, buyer_visible_summary").eq("circle_id", id).order("created_at", { ascending: false }).then(({ data }) => setReqs(data ?? []));
  }, [user, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}`} className="hover:text-green-800">Circle</Link> / Services</nav>
        <h1 className="text-3xl font-bold sm:text-4xl">Services</h1>
        <p className="mt-2 text-sm text-gray-500">Services AcrehubIndia is coordinating for your circle. Costs are always shown broken out; no money is collected through this platform.</p>
        <div className="mt-6 space-y-3">
          {reqs.map((r) => (
            <Link key={r.id as string} href={`/co-buy/circles/${id}/services/${r.id}`} className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md">
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{SERVICE_STATUS_LABELS[r.status as string] ?? (r.status as string)}</span>
              <h2 className="mt-2 font-semibold text-green-900">{r.title as string}</h2>
              <p className="text-sm text-gray-500">{serviceCategoryLabel(r.service_category as string)}</p>
              {r.buyer_visible_summary ? <p className="mt-1 text-sm text-gray-600">{r.buyer_visible_summary as string}</p> : null}
            </Link>
          ))}
          {reqs.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-400">No services yet.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
