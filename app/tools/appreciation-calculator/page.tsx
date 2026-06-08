import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AppreciationCalculator from "@/app/components/AppreciationCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land appreciation calculator — AcreHub",
  description: "Project the future value of agricultural land from a purchase price, an annual growth rate, and a time horizon, with a year-by-year schedule. Free and instant.",
  alternates: { canonical: "/tools/appreciation-calculator" },
};

export default async function AppreciationCalculatorPage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  const sp = await searchParams;
  const amount = sp.amount && Number(sp.amount) > 0 ? Number(sp.amount) : 5000000;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Land appreciation calculator</h1>
        <p className="mt-3 text-gray-600">Project future value at a compound annual growth rate, year by year.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <AppreciationCalculator defaultPrice={amount} />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Also try the <Link href="/tools/roi-calculator" className="font-medium text-green-800 hover:underline">ROI calculator</Link>{" "}
          or <Link href="/tools/emi-calculator" className="font-medium text-green-800 hover:underline">EMI calculator</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
