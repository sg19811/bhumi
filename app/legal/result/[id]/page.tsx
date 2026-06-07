import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import ResultScreen from "@/app/legal/wizard/ResultScreen";
import { headlineFor } from "@/app/lib/legal/eligibilityEngine";
import { stateLabel } from "@/app/lib/legal/options";
import type { EligibilityAnswers, EligibilityResult } from "@/app/lib/legal/types";

// Personal results: keep them out of search indexes.
export const metadata: Metadata = {
  title: "Your eligibility result | AcreHub",
  robots: { index: false, follow: false },
};

export default async function SavedResult({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("legal_eligibility_results")
    .select("id, answers, verdict, confidence, risk_score, rationale, references_list, next_steps")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Result not found</h1>
        <p className="mt-2 text-gray-500">This result link may have expired or is private.</p>
        <Link href="/legal/wizard" className="mt-6 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Run the eligibility check</Link>
      </main>
    );
  }

  const answers = data.answers as EligibilityAnswers;
  const result: EligibilityResult = {
    verdict: data.verdict,
    confidence: data.confidence,
    risk_score: data.risk_score,
    headline: headlineFor(data.verdict, stateLabel(answers.state)),
    rationale: data.rationale ?? [],
    references: data.references_list ?? [],
    next_steps: data.next_steps ?? [],
    needs_lawyer_review: data.verdict !== "likely_eligible",
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <ResultScreen result={result} answers={answers} resultId={data.id} />
    </main>
  );
}
