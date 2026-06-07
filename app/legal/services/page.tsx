import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import ServiceCard from "@/app/components/legal/ServiceCard";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Legal services for land buyers | AcreHub Legal",
  description: "Fixed-scope legal help for agricultural land — eligibility checks, document review, title search, NRI advisory, and full due diligence. Indicative pricing.",
  alternates: { canonical: "/legal/services" },
};

export default async function ServicesPage() {
  const { data: services } = await supabase
    .from("legal_services")
    .select("slug, name, description, included_items, target_users, turnaround_days_min, turnaround_days_max, starting_price_placeholder")
    .eq("published", true)
    .order("display_order");

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Legal services</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Clear, fixed-scope help — from a quick eligibility check to full due diligence before you buy.
      </p>
      <p className="mt-1 text-xs text-gray-400">Pricing shown is indicative; final quotes come from the assigned lawyer.</p>

      {services && services.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.slug} service={s} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          Service packages are being finalised.
        </div>
      )}
    </main>
  );
}
