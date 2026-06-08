import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import StampDutyCalculator from "@/app/components/StampDutyCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stamp duty & registration calculator — AcreHub",
  description: "Estimate the stamp duty, registration fee, and total cost to register agricultural land across Karnataka, Maharashtra, Tamil Nadu, Andhra Pradesh, and Kerala. Free and instant.",
  alternates: { canonical: "/tools/stamp-duty-calculator" },
};

export default async function StampDutyCalculatorPage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  const sp = await searchParams;
  const amount = sp.amount && Number(sp.amount) > 0 ? Number(sp.amount) : 5000000;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Stamp duty &amp; registration calculator</h1>
        <p className="mt-3 text-gray-600">Estimate what you&apos;ll pay over the price to register land — stamp duty, registration, and state-specific charges.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <StampDutyCalculator defaultPrice={amount} />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Planning the purchase? Try the <Link href="/tools/emi-calculator" className="font-medium text-green-800 hover:underline">EMI calculator</Link>{" "}
          or check <Link href="/legal" className="font-medium text-green-800 hover:underline">who can buy agricultural land →</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
