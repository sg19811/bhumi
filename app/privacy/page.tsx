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
            <h2 className="mb-1 font-semibold text-gray-900">Legal compliance &amp; your rights</h2>
            <p>AcreHub is an India-first service and aims to handle personal data consistent with India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. We process your data only for the purposes described above, on the basis of your use of the service and the consent you give when you submit information.</p>
            <p className="mt-2">Under applicable data-protection law you may have the right to: access the personal data we hold about you, ask us to correct or update it, request its deletion, and withdraw consent. To exercise these rights, contact us using the details below; we&apos;ll respond within a reasonable time.</p>
            <p className="mt-2"><strong>Visitors from the EU/EEA or UK:</strong> where the GDPR (or UK GDPR) applies to you, you additionally have rights of access, rectification, erasure, restriction of processing, data portability, and the right to lodge a complaint with your local supervisory authority.</p>
            <p className="mt-2"><strong>Cross-border storage:</strong> our infrastructure provider (Supabase) may store and process data on servers located outside India. By using AcreHub you consent to this transfer and storage. We are reviewing applicable data-localisation requirements as the DPDP rules are finalised.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Contact &amp; grievances</h2>
            <p>For privacy questions or to exercise your data rights — or to raise a grievance about how your data is handled — reach us through the contact details on the site. We&apos;ll appoint and publish a dedicated grievance/data-protection contact as required before scaling.</p>
          </section>
          <p className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            This is a plain-language summary, <strong>not legal advice and not yet reviewed by a lawyer</strong>. The compliance statements above (including DPDP Act, GDPR, and data-localisation references) are indicative and must be reviewed and tailored by a qualified lawyer before you rely on them for a production business.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
