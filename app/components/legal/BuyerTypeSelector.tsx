"use client";

import OptionButtons from "@/app/components/legal/OptionButtons";
import { BUYER_TYPE_OPTIONS } from "@/app/lib/legal/options";
import type { BuyerType } from "@/app/lib/legal/types";

export default function BuyerTypeSelector({ value, onChange }: { value?: BuyerType; onChange: (v: BuyerType) => void }) {
  return <OptionButtons options={BUYER_TYPE_OPTIONS} value={value} onChange={onChange} columns={2} />;
}
