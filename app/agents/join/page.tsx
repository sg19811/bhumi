import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AgentJoinForm from "@/app/components/agents/AgentJoinForm";

export const metadata: Metadata = {
  title: "Join as a land agent | Acrehub Agent Network",
  description:
    "Apply to the Acrehub Agent Network. Send land opportunities over WhatsApp, get every listing and enquiry routed back to you. No dashboard required.",
  alternates: { canonical: "/agents/join" },
};

export default function AgentJoinPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">Join the Acrehub Agent Network</h1>
        <p className="mt-2 text-gray-600">
          Already working with land? List your properties on Acrehub and reach serious buyers.
          Once you&apos;re in, you can simply <strong>send property details over WhatsApp</strong> and our team
          turns them into listings — every click and enquiry routes back to you. No dashboard to learn.
        </p>

        <div className="my-6">
          <AgentJoinForm />
        </div>

        <p className="text-xs text-gray-400">
          Applying does not guarantee acceptance. AcrehubIndia verifies every agent before activation and
          may decline or suspend agents for fake, duplicate, or unethical listings.
        </p>
      </main>
      <Footer />
    </div>
  );
}
