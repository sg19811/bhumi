import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import RoiCalculator from "@/app/components/RoiCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land ROI calculator — AcreHub",
  description: "Estimate total return and annualised IRR on agricultural land: purchase price, holding period, expected price growth, and rental/farm income. Free and instant.",
  alternates: { canonical: "/tools/roi-calculator" },
};

export default async function RoiCalculatorPage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  const sp = await searchParams;
  const amount = sp.amount && Number(sp.amount) > 0 ? Number(sp.amount) : 5000000;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Land ROI calculator</h1>
        <p className="mt-3 text-gray-600">See total return and annualised IRR from price growth plus any rental or farm income.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <RoiCalculator defaultPrice={amount} />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Also try the <Link href="/tools/appreciation-calculator" className="font-medium text-green-800 hover:underline">appreciation calculator</Link>{" "}
          or <Link href="/tools/emi-calculator" className="font-medium text-green-800 hover:underline">EMI calculator</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
