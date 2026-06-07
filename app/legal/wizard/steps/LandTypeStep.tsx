"use client";

import LandTypeSelector from "@/app/components/legal/LandTypeSelector";
import type { StepProps } from "./stepProps";

export default function LandTypeStep({ answers, update }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold">What kind of land?</h2>
      <p className="mt-1 mb-5 text-gray-600">Agricultural, plantation, NA-converted and farmhouse land follow different rules.</p>
      <LandTypeSelector value={answers.land_type} onChange={(land_type) => update({ land_type })} />
    </div>
  );
}
