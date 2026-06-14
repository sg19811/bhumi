import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "How the Acrehub Agent Network works",
  description: "Send land opportunities to Acrehub over WhatsApp. We turn them into trustworthy listings and route every buyer enquiry back to you.",
  alternates: { canonical: "/agents/how-it-works" },
};

const STEPS = [
  { n: "1", t: "Apply once", d: "Fill the short join form. Our team calls you within 1–2 working days to verify you." },
  { n: "2", t: "Send properties on WhatsApp", d: "Just message the property details (and photos / a voice note). No app, no dashboard, no forms." },
  { n: "3", t: "We build the listing", d: "Acrehub structures and reviews each message, then publishes a clean, honest listing in your name." },
  { n: "4", t: "Leads route back to you", d: "Every click and buyer enquiry on your listing comes straight back to you. Close the deal your way." },
];

export default function AgentsHowItWorks() {
  const wa = process.env.NEXT_PUBLIC_ACREHUB_WHATSAPP_NUMBER;
  const waDigits = wa?.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">How the Agent Network works</h1>
        <p className="mt-2 text-gray-600">Built for how land agents in India actually work — on WhatsApp, not dashboards.</p>

        <ol className="mt-8 space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">{s.n}</div>
              <div>
                <h2 className="font-semibold text-gray-900">{s.t}</h2>
                <p className="mt-0.5 text-sm text-gray-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        {wa && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-medium text-green-900">Send properties to Acrehub on WhatsApp</p>
            <p className="mt-1 text-2xl font-bold text-green-800">{wa}</p>
            {waDigits && (
              <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white">💬 Open WhatsApp</a>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/agents/join" className="inline-block rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800">Apply to join the network</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
