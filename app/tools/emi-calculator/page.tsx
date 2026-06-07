import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import EmiCalculator from "@/app/components/EmiCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land loan EMI calculator — AcreHub",
  description: "Estimate the monthly EMI, total interest, and total payable for a land loan. Free and instant.",
};

export default async function EmiCalculatorPage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  const sp = await searchParams;
  const amount = sp.amount && Number(sp.amount) > 0 ? Number(sp.amount) : 5000000;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Land loan EMI calculator</h1>
        <p className="mt-3 text-gray-600">Estimate your monthly payment, total interest, and total cost of a land loan.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <EmiCalculator defaultAmount={amount} />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Ready to buy? <Link href="/explore" className="font-medium text-green-800 hover:underline">Browse land</Link> or check{" "}
          <Link href="/legal" className="font-medium text-green-800 hover:underline">who can buy farmland</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
