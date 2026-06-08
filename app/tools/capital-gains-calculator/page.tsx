import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CapitalGainsCalculator from "@/app/components/CapitalGainsCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capital gains tax calculator (land sale) — AcreHub",
  description: "Estimate short- or long-term capital gains and the indicative tax when you sell agricultural or other land in India. Free and instant — not tax advice.",
  alternates: { canonical: "/tools/capital-gains-calculator" },
};

export default function CapitalGainsCalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Capital gains tax calculator</h1>
        <p className="mt-3 text-gray-600">Estimate the gain and indicative tax when you sell land. A planning aid — not tax advice.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <CapitalGainsCalculator />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Selling land? You may also want the <Link href="/tools/roi-calculator" className="font-medium text-green-800 hover:underline">ROI calculator</Link>{" "}
          or our <Link href="/legal" className="font-medium text-green-800 hover:underline">legal navigator →</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
