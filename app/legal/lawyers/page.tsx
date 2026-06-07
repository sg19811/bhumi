import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import LawyerCard from "@/app/components/legal/LawyerCard";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land lawyers directory | AcreHub Legal",
  description: "Connect with verified land lawyers across Karnataka and Maharashtra for agricultural land purchase, NRI advisory, conversion, and document review.",
  alternates: { canonical: "/legal/lawyers" },
};

export default async function LawyersPage() {
  const { data: lawyers } = await supabase
    .from("lawyers")
    .select("*")
    .eq("published", true)
    .order("experience_years", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Land lawyers</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Verified advocates who handle agricultural land — eligibility, NRI cases, conversion, title and document review.
      </p>

      <div className="my-6"><LegalDisclaimer variant="result" page="lawyers" /></div>

      {lawyers && lawyers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((l) => <LawyerCard key={l.id} lawyer={l} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          We&apos;re onboarding verified lawyers. Check back soon.
        </div>
      )}
    </main>
  );
}
