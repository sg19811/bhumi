import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LoanEligibilityCalculator from "@/app/components/LoanEligibilityCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land loan eligibility calculator — AcreHub",
  description: "Find out roughly how much land loan you can borrow from your monthly income, existing EMIs, interest rate, and tenure — plus an indicative property budget. Free and instant.",
  alternates: { canonical: "/tools/loan-eligibility-calculator" },
};

export default function LoanEligibilityCalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Land loan eligibility calculator</h1>
        <p className="mt-3 text-gray-600">See roughly how much you can borrow — and what property budget that supports.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <LoanEligibilityCalculator />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Next, estimate repayments with the <Link href="/tools/emi-calculator" className="font-medium text-green-800 hover:underline">EMI calculator</Link>{" "}
          or registration costs with the <Link href="/tools/stamp-duty-calculator" className="font-medium text-green-800 hover:underline">stamp duty calculator</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
