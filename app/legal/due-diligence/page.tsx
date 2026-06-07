import type { Metadata } from "next";
import DueDiligence from "./DueDiligence";

export const metadata: Metadata = {
  title: "10-step land due diligence checklist | AcreHub Legal",
  description: "Work through the 10 essential checks before buying land — ownership, title chain, encumbrance, mutation, survey, litigation, access, zoning, co-owners and possession.",
  alternates: { canonical: "/legal/due-diligence" },
};

export default async function DueDiligencePage({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams;
  const scope = listing || "standalone";
  return <DueDiligence scope={scope} forListing={!!listing} />;
}
