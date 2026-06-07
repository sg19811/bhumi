"use client";

import StateSelector from "@/app/components/legal/StateSelector";
import type { StepProps } from "./stepProps";

export default function StateStep({ answers, update }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Where is the land?</h2>
      <p className="mt-1 mb-5 text-gray-600">Land law differs by state. Pick the state where the land is located.</p>
      <StateSelector value={answers.state} onChange={(state) => update({ state })} />
    </div>
  );
}
