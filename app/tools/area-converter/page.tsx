import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AreaConverter from "@/app/components/AreaConverter";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land area converter — acre, guntha, hectare, cent — AcreHub",
  description: "Convert agricultural land area between acres, gunthas, hectares, cents, and square feet. Free, instant, and accurate.",
};

export default function AreaConverterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Land area converter</h1>
        <p className="mt-3 text-gray-600">
          Convert between the units used for agricultural land in India. Enter a value and pick a unit.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <AreaConverter />
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Looking for land? <Link href="/explore" className="font-medium text-green-800 hover:underline">Browse listings</Link> or{" "}
          <Link href="/listing/new" className="font-medium text-green-800 hover:underline">list your own</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
