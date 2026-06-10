import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Thanks — we'll be in touch | Acrehub Buying Circles",
  robots: { index: false },
};

export default async function CoBuyThanks({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">✓</div>
        <h1 className="mb-2 text-2xl font-bold">Thanks — your interest is in</h1>
        <p className="mb-2 text-gray-600">
          AcrehubIndia will call you within <strong>24–48 hours</strong> to understand what you&apos;re looking for and explain the parcel, its legal status, and the process.
        </p>
        <p className="mb-8 text-sm text-gray-400">
          Remember: this was an expression of interest only — it creates no obligation, and you acquire no ownership until a registered sale deed is executed in your name.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/co-buy/${slug}`} className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Back to the opportunity</Link>
          <Link href="/co-buy" className="rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50">See other opportunities</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
