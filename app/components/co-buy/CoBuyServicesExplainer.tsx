import { CO_BUY_SERVICE_CATEGORIES } from "@/app/lib/co-buy/service-categories";
import { CO_BUY_DISCLAIMERS } from "@/app/lib/co-buy/disclaimers";

// Read-only overview of the services AcrehubIndia can coordinate. No workflow,
// no quotes — that's Phase 3. This just sets expectations honestly.
export default function CoBuyServicesExplainer() {
  return (
    <section>
      <h2 className="mb-2 text-2xl font-bold sm:text-3xl">Services AcrehubIndia can coordinate</h2>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">{CO_BUY_DISCLAIMERS.servicesCoordination}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CO_BUY_SERVICE_CATEGORIES.map((c) => (
          <div key={c.key} className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">{c.label}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{c.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
