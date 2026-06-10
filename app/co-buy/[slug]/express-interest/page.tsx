import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import CoBuyInterestForm from "@/app/components/co-buy/CoBuyInterestForm";
import CoBuyLegalDisclaimer from "@/app/components/co-buy/CoBuyLegalDisclaimer";
import { CO_BUY_PUBLIC_STATUSES } from "@/app/lib/co-buy/types";

export const metadata: Metadata = {
  title: "Express interest | Acrehub Buying Circles",
  robots: { index: false },
};

export default async function ExpressInterest({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: opp } = await supabase
    .from("co_buy_opportunities")
    .select("id, slug, title, status")
    .eq("slug", slug)
    .in("status", CO_BUY_PUBLIC_STATUSES)
    .maybeSingle();
  if (!opp) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-6 sm:py-10">
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/co-buy" className="hover:text-green-800">Buying Circles</Link>
          <span aria-hidden="true" className="text-gray-300">/</span>
          <Link href={`/co-buy/${slug}`} className="truncate hover:text-green-800">{opp.title}</Link>
        </nav>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Express interest</h1>
        <p className="mt-2 text-gray-600">
          For <strong>{opp.title}</strong>. This is free and non-binding — it simply starts a conversation. We&apos;ll call you within 24–48 hours.
        </p>

        <div className="my-6">
          <CoBuyInterestForm opportunityId={opp.id} slug={slug} />
        </div>

        <CoBuyLegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
}
