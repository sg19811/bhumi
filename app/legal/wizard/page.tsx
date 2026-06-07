import type { Metadata } from "next";
import Wizard from "./Wizard";
import LegalTrack from "@/app/components/legal/LegalTrack";

export const metadata: Metadata = {
  title: "Land eligibility wizard — can you buy this land? | AcreHub",
  description:
    "Answer a few questions and get an instant, informational read on whether you can buy agricultural land in your state — plus your next steps. Not legal advice.",
  alternates: { canonical: "/legal/wizard" },
};

export default function WizardPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <LegalTrack event="legal_wizard_started" />
      <Wizard />
    </main>
  );
}
