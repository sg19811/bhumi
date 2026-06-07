"use client";

import OptionButtons from "@/app/components/legal/OptionButtons";
import { LAND_TYPE_OPTIONS } from "@/app/lib/legal/options";
import type { LandType } from "@/app/lib/legal/types";

export default function LandTypeSelector({ value, onChange }: { value?: LandType; onChange: (v: LandType) => void }) {
  return <OptionButtons options={LAND_TYPE_OPTIONS} value={value} onChange={onChange} columns={2} />;
}
