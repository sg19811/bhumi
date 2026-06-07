"use client";

import BuyerTypeSelector from "@/app/components/legal/BuyerTypeSelector";
import OptionButtons from "@/app/components/legal/OptionButtons";
import { FARMER_STATUS_OPTIONS } from "@/app/lib/legal/options";
import type { StepProps } from "./stepProps";

const INDIVIDUALS = ["farmer_resident", "non_farmer_resident", "nri", "oci", "huf"];

export default function BuyerTypeStep({ answers, update }: StepProps) {
  const isIndividual = !answers.buyer_type || INDIVIDUALS.includes(answers.buyer_type);
  return (
    <div>
      <h2 className="text-2xl font-bold">Who is buying?</h2>
      <p className="mt-1 mb-5 text-gray-600">Restrictions vary by buyer type — individual, NRI, company, trust, and so on.</p>
      <BuyerTypeSelector value={answers.buyer_type} onChange={(buyer_type) => update({ buyer_type })} />

      {isIndividual && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Are you a farmer? (some states still ask)</h3>
          <OptionButtons options={FARMER_STATUS_OPTIONS} value={answers.farmer_status} onChange={(farmer_status) => update({ farmer_status })} columns={3} />
        </div>
      )}

      <label className="mt-6 flex items-start gap-2.5 rounded-xl border border-gray-200 p-3.5 text-sm">
        <input
          type="checkbox"
          checked={!!answers.existing_agri_land}
          onChange={(e) => update({ existing_agri_land: e.target.checked })}
          className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green-700"
        />
        <span className="text-gray-700">I already own agricultural land (helps flag ceiling limits)</span>
      </label>
    </div>
  );
}
