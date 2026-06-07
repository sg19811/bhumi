"use client";

import OptionButtons from "@/app/components/legal/OptionButtons";
import { STATES } from "@/app/lib/legal/options";

export default function StateSelector({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return <OptionButtons options={STATES} value={value} onChange={onChange} columns={2} />;
}
