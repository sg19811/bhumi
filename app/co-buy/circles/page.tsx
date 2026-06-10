"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { CIRCLE_STATUS_LABELS } from "@/app/lib/co-buy/circles/types";

export default function MyCircles() {
  const { user, loading } = useAuth();
  const [circles, setCircles] = useState<Record<string, unknown>[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    // RLS returns only circles the signed-in user is an active member of.
    supabase.from("co_buy_circles").select("*, co_buy_opportunities(title)").then(({ data }) => { setCircles(data ?? []); setFetched(true); });
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">My buying circles</h1>
        {loading ? (
          <p className="mt-6 text-gray-400">Loading…</p>
        ) : !user ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-12 text-center">
            <p className="mb-4 text-gray-500">Sign in to see the buying circles you&apos;re part of.</p>
            <Link href="/auth/signin" className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Sign in</Link>
          </div>
        ) : circles.length === 0 && fetched ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-12 text-center">
            <p className="mb-4 text-gray-500">You&apos;re not in any buying circles yet.</p>
            <Link href="/co-buy" className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Explore opportunities</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {circles.map((c) => (
              <Link key={c.id as string} href={`/co-buy/circles/${c.id}`} className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md">
                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{CIRCLE_STATUS_LABELS[c.status as keyof typeof CIRCLE_STATUS_LABELS] ?? (c.status as string)}</span>
                <h2 className="mt-2 text-lg font-semibold text-green-900">{c.name as string}</h2>
                <p className="text-sm text-gray-500">{(c.co_buy_opportunities as { title?: string })?.title ?? ""}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
