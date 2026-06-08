import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land tools — AcreHub",
  description: "Free tools for agricultural land buyers and sellers: area converter, EMI, ROI, and appreciation calculators.",
};

const tools = [
  { href: "/tools/area-converter", title: "Area converter", desc: "Convert between acres, gunthas, hectares, cents, and sq ft." },
  { href: "/tools/emi-calculator", title: "EMI calculator", desc: "Estimate monthly payment, interest, and total cost of a land loan." },
  { href: "/tools/roi-calculator", title: "ROI calculator", desc: "Total return and annualised IRR from price growth plus rental/farm income." },
  { href: "/tools/appreciation-calculator", title: "Appreciation calculator", desc: "Project future land value at a compound annual growth rate, year by year." },
];

export default function ToolsHub() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Tools</h1>
        <p className="mt-3 text-gray-600">Free helpers for buying and selling agricultural land.</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md">
              <h2 className="font-semibold text-green-800">{t.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
