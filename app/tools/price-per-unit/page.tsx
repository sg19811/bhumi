import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PricePerUnitCalculator from "@/app/components/PricePerUnitCalculator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price per unit calculator — AcreHub",
  description: "Convert a land price into ₹ per acre, guntha, cent, hectare, and sq ft at once, so you can compare plots quoted in different units. Free and instant.",
  alternates: { canonical: "/tools/price-per-unit" },
};

export default async function PricePerUnitPage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  const sp = await searchParams;
  const amount = sp.amount && Number(sp.amount) > 0 ? Number(sp.amount) : 4500000;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Price per unit calculator</h1>
        <p className="mt-3 text-gray-600">Compare plots fairly — see the same price as ₹ per acre, guntha, cent, hectare, and sq ft.</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <PricePerUnitCalculator defaultPrice={amount} />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Switching units? The <Link href="/tools/area-converter" className="font-medium text-green-800 hover:underline">area converter</Link>{" "}
          handles land sizes, and <Link href="/explore" className="font-medium text-green-800 hover:underline">explore</Link> shows ₹/acre on every listing.
        </p>
      </main>
      <Footer />
    </div>
  );
}
