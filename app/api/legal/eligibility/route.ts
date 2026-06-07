import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { computeEligibility, insufficientForUncoveredState } from "@/app/lib/legal/eligibilityEngine";
import { getPublishedStateRule } from "@/app/lib/legal/stateRules";
import type { EligibilityAnswers } from "@/app/lib/legal/types";

export const dynamic = "force-dynamic";

const REQUIRED: (keyof EligibilityAnswers)[] = ["state", "citizenship", "buyer_type", "land_type", "purpose"];

export async function POST(request: Request) {
  let answers: EligibilityAnswers;
  try {
    answers = (await request.json()) as EligibilityAnswers;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  for (const key of REQUIRED) {
    if (!answers?.[key]) {
      return NextResponse.json({ error: `Missing answer: ${key}` }, { status: 400 });
    }
  }

  // Load lawyer-reviewed, published rule for the state (null if not covered yet).
  const rule = await getPublishedStateRule(answers.state);
  const result = rule ? computeEligibility(answers, rule) : insufficientForUncoveredState(answers);

  // Persist (anonymous: user_id null) so results are shareable by link.
  const { data, error } = await supabase
    .from("legal_eligibility_results")
    .insert({
      user_id: null,
      state: answers.state,
      answers,
      verdict: result.verdict,
      confidence: result.confidence,
      risk_score: result.risk_score,
      rationale: result.rationale,
      references_list: result.references,
      next_steps: result.next_steps,
    })
    .select("id")
    .single();

  if (error) {
    // Still return the computed result even if persistence fails.
    return NextResponse.json({ id: null, result, answers, warning: "not_saved" });
  }

  return NextResponse.json({ id: data.id, result, answers });
}
