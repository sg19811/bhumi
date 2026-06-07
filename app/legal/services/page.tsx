import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import ServiceCard from "@/app/components/legal/ServiceCard";
import { stateLabel } from "@/app/lib/legal/options";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Legal services for land buyers | AcreHub Legal",
  description: "Fixed-scope legal help for agricultural land — eligibility checks, document review, title search, NRI advisory, full due diligence, and state-specific reviews. Indicative pricing.",
  alternates: { canonical: "/legal/services" },
};

export default async function ServicesPage() {
  // select(*) keeps this resilient before the `state` column migration runs.
  const { data } = await supabase
    .from("legal_services")
    .select("*")
    .eq("published", true)
    .order("display_order");

  const services = data ?? [];
  const general = services.filter((s) => !s.state);
  const byState = services.filter((s) => s.state);
  const states = [...new Set(byState.map((s) => s.state as string))];

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Legal services</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Clear, fixed-scope help — from a quick eligibility check to full due diligence before you buy.
      </p>
      <p className="mt-1 text-xs text-gray-400">Pricing shown is indicative; final quotes come from the assigned lawyer.</p>

      {services.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          Service packages are being finalised.
        </div>
      ) : (
        <>
          {general.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">For any state</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {general.map((s) => <ServiceCard key={s.slug} service={s} />)}
              </div>
            </section>
          )}

          {states.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-1 text-lg font-semibold text-gray-700">State-specific reviews</h2>
              <p className="mb-4 text-sm text-gray-500">Targeted checks for the risks that matter most in each state.</p>
              <div className="space-y-8">
                {states.map((st) => (
                  <div key={st}>
                    <h3 className="mb-3 text-base font-semibold text-green-800">{stateLabel(st)}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {byState.filter((s) => s.state === st).map((s) => <ServiceCard key={s.slug} service={s} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
