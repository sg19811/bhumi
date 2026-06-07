"use client";

import { stateLabel, landTypeLabel, buyerTypeLabel, CITIZENSHIP_OPTIONS, PURPOSE_OPTIONS } from "@/app/lib/legal/options";
import type { StepProps } from "./stepProps";

function row(label: string, value?: string) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value || "—"}</span>
    </div>
  );
}

export default function ReviewStep({ answers }: StepProps) {
  const citizenship = CITIZENSHIP_OPTIONS.find((o) => o.value === answers.citizenship)?.label;
  const purpose = PURPOSE_OPTIONS.find((o) => o.value === answers.purpose)?.label;
  return (
    <div>
      <h2 className="text-2xl font-bold">Review your answers</h2>
      <p className="mt-1 mb-5 text-gray-600">Check these are right, then get your eligibility read.</p>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {row("State", answers.state ? stateLabel(answers.state) : undefined)}
        {row("Citizenship", citizenship)}
        {row("Buyer type", answers.buyer_type ? buyerTypeLabel(answers.buyer_type) : undefined)}
        {row("Land type", answers.land_type ? landTypeLabel(answers.land_type) : undefined)}
        {row("Purpose", purpose)}
        {row("District", answers.district)}
        {row("Already owns agri land", answers.existing_agri_land ? "Yes" : "No")}
      </div>
    </div>
  );
}
