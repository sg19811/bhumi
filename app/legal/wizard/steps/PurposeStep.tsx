"use client";

import OptionButtons from "@/app/components/legal/OptionButtons";
import { PURPOSE_OPTIONS } from "@/app/lib/legal/options";
import type { StepProps } from "./stepProps";

export default function PurposeStep({ answers, update }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold">What will you use it for?</h2>
      <p className="mt-1 mb-5 text-gray-600">Non-farming uses often need land conversion (NA permission).</p>
      <OptionButtons options={PURPOSE_OPTIONS} value={answers.purpose} onChange={(purpose) => update({ purpose })} columns={2} />
    </div>
  );
}
