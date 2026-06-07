"use client";

import { useMemo, useState } from "react";
import type { EligibilityAnswers, EligibilityResult } from "@/app/lib/legal/types";
import { track } from "@/app/lib/legal/analytics";
import WizardProgress from "@/app/components/legal/WizardProgress";
import StateStep from "./steps/StateStep";
import CitizenshipStep from "./steps/CitizenshipStep";
import BuyerTypeStep from "./steps/BuyerTypeStep";
import LandTypeStep from "./steps/LandTypeStep";
import PurposeStep from "./steps/PurposeStep";
import DetailsStep from "./steps/DetailsStep";
import ReviewStep from "./steps/ReviewStep";
import ResultScreen from "./ResultScreen";

const STEPS = [
  { id: "state", label: "State", Comp: StateStep, required: "state" },
  { id: "citizenship", label: "Citizenship", Comp: CitizenshipStep, required: "citizenship" },
  { id: "buyer_type", label: "Buyer", Comp: BuyerTypeStep, required: "buyer_type" },
  { id: "land_type", label: "Land type", Comp: LandTypeStep, required: "land_type" },
  { id: "purpose", label: "Purpose", Comp: PurposeStep, required: "purpose" },
  { id: "details", label: "Details", Comp: DetailsStep, required: null },
  { id: "review", label: "Review", Comp: ReviewStep, required: null },
] as const;

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<EligibilityAnswers>>({
    resident_status: "resident",
    farmer_status: "non_farmer",
    existing_agri_land: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [final, setFinal] = useState<{ id: string | null; result: EligibilityResult; answers: EligibilityAnswers } | null>(null);

  const labels = useMemo(() => STEPS.map((s) => s.label), []);
  const current = STEPS[step];
  const Comp = current.Comp;
  const canAdvance = !current.required || !!answers[current.required as keyof EligibilityAnswers];

  function update(patch: Partial<EligibilityAnswers>) {
    setAnswers((a) => ({ ...a, ...patch }));
  }

  function next() {
    if (!canAdvance) {
      setError("Please make a selection to continue.");
      return;
    }
    setError("");
    track("legal_wizard_step_completed", { step_id: current.id, step_index: step, state: answers.state });
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/legal/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      const data = await res.json();
      setFinal({ id: data.id ?? null, result: data.result, answers: data.answers });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (final) {
    return <ResultScreen result={final.result} answers={final.answers} resultId={final.id} trackOnMount />;
  }

  const isReview = step === STEPS.length - 1;

  return (
    <div>
      <WizardProgress steps={labels} current={step} />

      <div className="min-h-[280px]">
        <Comp answers={answers} update={update} />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
        >
          ← Back
        </button>
        {isReview ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-full bg-green-700 px-7 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? "Checking…" : "Get my result"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="rounded-full bg-green-700 px-7 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-40"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
