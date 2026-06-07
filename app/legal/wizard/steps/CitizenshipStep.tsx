"use client";

import OptionButtons from "@/app/components/legal/OptionButtons";
import { CITIZENSHIP_OPTIONS } from "@/app/lib/legal/options";
import type { StepProps } from "./stepProps";
import type { EligibilityAnswers } from "@/app/lib/legal/types";

export default function CitizenshipStep({ answers, update }: StepProps) {
  function onChange(citizenship: EligibilityAnswers["citizenship"]) {
    // Derive residency: resident only for Indian citizens by default.
    const resident_status: EligibilityAnswers["resident_status"] = citizenship === "indian" ? "resident" : "non_resident";
    update({ citizenship, resident_status });
  }
  return (
    <div>
      <h2 className="text-2xl font-bold">What&apos;s your citizenship status?</h2>
      <p className="mt-1 mb-5 text-gray-600">This decides which ownership rules (including RBI/FEMA) apply to you.</p>
      <OptionButtons options={CITIZENSHIP_OPTIONS} value={answers.citizenship} onChange={onChange} columns={2} />
    </div>
  );
}
