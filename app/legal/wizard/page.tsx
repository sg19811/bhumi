import type { Metadata } from "next";
import Wizard from "./Wizard";
import LegalTrack from "@/app/components/legal/LegalTrack";
import { STATES, LAND_TYPE_OPTIONS } from "@/app/lib/legal/options";
import { marketplaceLandTypeToLegal } from "@/app/lib/legal/landMap";
import type { EligibilityAnswers, LandType } from "@/app/lib/legal/types";

export const metadata: Metadata = {
  title: "Land eligibility wizard — can you buy this land? | AcreHub",
  description:
    "Answer a few questions and get an instant, informational read on whether you can buy agricultural land in your state — plus your next steps. Not legal advice.",
  alternates: { canonical: "/legal/wizard" },
};

export default async function WizardPage({ searchParams }: { searchParams: Promise<{ state?: string; land_type?: string }> }) {
  const sp = await searchParams;
  const initial: Partial<EligibilityAnswers> = {};
  if (sp.state && STATES.some((s) => s.value === sp.state)) initial.state = sp.state;
  // Accept either a legal land type directly, or a marketplace value to map.
  const legalLt: LandType | null =
    (LAND_TYPE_OPTIONS.some((o) => o.value === sp.land_type) ? (sp.land_type as LandType) : null) ??
    marketplaceLandTypeToLegal(sp.land_type);
  if (legalLt) initial.land_type = legalLt;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <LegalTrack event="legal_wizard_started" props={{ state: initial.state ?? null }} />
      <Wizard initial={initial} />
    </main>
  );
}
