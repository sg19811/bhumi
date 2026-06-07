import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — AcreHub",
  description: "How AcreHub collects, uses, and protects your information.",
};

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">What we collect</h2>
            <p>When you use AcreHub we may collect: account details (email, and the name/phone you provide), the content of listings and buyer requirements you post (including contact details), inquiries you send, and anonymous search activity used to improve the product.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">How we use it</h2>
            <p>To run the marketplace — show listings and requirements, connect buyers and sellers, and improve search and matching. We do not sell your personal data.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Information shown publicly</h2>
            <p>Listings you post are public, including the contact details you add so buyers can reach you. Buyer requirements you post are also public, including the contact you provide so sellers can reach you. Don&apos;t include anything you don&apos;t want shown publicly.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Storage &amp; security</h2>
            <p>Data is stored with our infrastructure provider (Supabase). We use access controls to protect it, but no online service can be guaranteed perfectly secure.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Your choices</h2>
            <p>You can edit or remove your listings, and request deletion of your account data by contacting us. Removing a listing removes it from public view.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Contact</h2>
            <p>Questions about privacy? Reach us through the contact details on the site.</p>
          </section>
          <p className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            This is a plain-language summary, not legal advice. Have a lawyer review and tailor it before relying on it for a production business.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
