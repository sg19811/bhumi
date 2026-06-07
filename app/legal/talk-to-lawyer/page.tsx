import type { Metadata } from "next";
import LeadCaptureForm from "@/app/components/legal/LeadCaptureForm";
import TrustBadgesRow from "@/app/components/legal/TrustBadgesRow";

export const metadata: Metadata = {
  title: "Talk to a verified land lawyer | AcreHub Legal",
  description: "Share your details and we'll connect you with a verified land lawyer for your state. Informational service — not legal advice.",
  alternates: { canonical: "/legal/talk-to-lawyer" },
};

export default async function TalkToLawyer({
  searchParams,
}: {
  searchParams: Promise<{ lawyer?: string; service?: string; state?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="mx-auto max-w-lg px-5 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Talk to a verified lawyer</h1>
      <p className="mt-2 text-gray-600">
        Tell us about your land question and we&apos;ll connect you with a verified land lawyer for your state. No obligation.
      </p>

      <div className="my-6">
        <LeadCaptureForm
          source="/legal/talk-to-lawyer"
          defaults={{
            state: sp.state,
            related_lawyer_id: sp.lawyer,
            related_service_slug: sp.service,
          }}
        />
      </div>

      <TrustBadgesRow />
    </main>
  );
}
