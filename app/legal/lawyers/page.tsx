import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import LawyerCard from "@/app/components/legal/LawyerCard";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import { STATES, stateLabel } from "@/app/lib/legal/options";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land lawyers directory | AcreHub Legal",
  description: "Connect with verified land lawyers across Karnataka, Maharashtra, Tamil Nadu, Andhra Pradesh and Kerala for agricultural land purchase, NRI advisory, conversion, and document review.",
  alternates: { canonical: "/legal/lawyers" },
};

export default async function LawyersPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const active = state && STATES.some((s) => s.value === state) ? state : null;

  let query = supabase.from("lawyers").select("*").eq("published", true);
  if (active) query = query.eq("state", active);
  const { data: lawyers } = await query.order("experience_years", { ascending: false });

  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        isActive ? "border-green-600 bg-green-50 font-medium text-green-800" : "border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Land lawyers</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Verified advocates who handle agricultural land — eligibility, NRI cases, conversion, title and document review.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {chip("/legal/lawyers", "All states", !active)}
        {STATES.map((s) => chip(`/legal/lawyers?state=${s.value}`, s.label, active === s.value))}
      </div>

      <div className="my-6"><LegalDisclaimer variant="result" page="lawyers" /></div>

      {lawyers && lawyers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((l) => <LawyerCard key={l.id} lawyer={l} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          {active ? `No verified lawyers listed for ${stateLabel(active)} yet.` : "We’re onboarding verified lawyers. Check back soon."}
        </div>
      )}
    </main>
  );
}
