"use client";

import Link from "next/link";
import { track } from "@/app/lib/legal/analytics";
import { stateLabel } from "@/app/lib/legal/options";

type Service = {
  slug: string;
  name: string;
  description?: string | null;
  included_items: string[];
  turnaround_days_min?: number | null;
  turnaround_days_max?: number | null;
  starting_price_placeholder?: number | null;
  state?: string | null;
};

export default function ServiceCard({ service }: { service: Service }) {
  const turnaround =
    service.turnaround_days_min && service.turnaround_days_max
      ? `${service.turnaround_days_min}–${service.turnaround_days_max} days`
      : null;
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {service.state && (
        <span className="mb-2 inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">{stateLabel(service.state)}</span>
      )}
      <h3 className="font-semibold text-gray-900">{service.name}</h3>
      {service.description && <p className="mt-1 text-sm text-gray-500">{service.description}</p>}

      <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
        {service.included_items.slice(0, 5).map((it, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-green-700">✓</span> {it}</li>
        ))}
      </ul>

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
        <div>
          {service.starting_price_placeholder != null && (
            <p className="text-lg font-bold text-green-800">from ₹{service.starting_price_placeholder.toLocaleString("en-IN")}<span className="text-xs font-normal text-gray-400">*</span></p>
          )}
          {turnaround && <p className="text-xs text-gray-400">{turnaround}</p>}
        </div>
      </div>

      <div className="mt-3">
        <Link
          href={`/legal/talk-to-lawyer?service=${service.slug}`}
          onClick={() => track("legal_service_card_clicked", { service_slug: service.slug })}
          className="block rounded-full bg-green-700 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Get started
        </Link>
      </div>
      <p className="mt-2 text-center text-[10px] uppercase tracking-wide text-gray-400">Indicative pricing</p>
    </div>
  );
}
