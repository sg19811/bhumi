"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { formatINRShort } from "@/app/lib/format";
import type { FarmProjectPlot } from "@/app/lib/farm-plots/types";

type SortKey = "plot_label" | "size_value" | "price" | "status";

const statusStyle: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-amber-100 text-amber-800",
  on_hold: "bg-amber-100 text-amber-800",
  sold: "bg-gray-200 text-gray-600",
};

export default function PlotInventoryTable({ listingId }: { listingId: string }) {
  const [plots, setPlots] = useState<FarmProjectPlot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "size_value", asc: true });

  useEffect(() => {
    let on = true;
    // RLS handles visibility. If the table doesn't exist yet (migration not run),
    // supabase returns an error → we just show the empty state. No crash.
    supabase
      .from("farm_project_plots")
      .select("*")
      .eq("listing_id", listingId)
      .then(({ data, error }) => {
        if (!on) return;
        if (!error && Array.isArray(data)) setPlots(data as FarmProjectPlot[]);
        setLoaded(true);
      });
    return () => { on = false; };
  }, [listingId]);

  if (!loaded) return null;

  if (plots.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Plot inventory</h2>
        <p className="rounded-2xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">
          Plot inventory will appear here once the developer adds it.
        </p>
      </section>
    );
  }

  const sorted = [...plots].sort((a, b) => {
    const { key, asc } = sort;
    let cmp = 0;
    if (key === "size_value" || key === "price") cmp = (Number(a[key] ?? 0)) - (Number(b[key] ?? 0));
    else cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""));
    return asc ? cmp : -cmp;
  });

  const th = (key: SortKey, label: string, align = "left") => (
    <th
      onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }))}
      className={`cursor-pointer select-none px-4 py-2 font-medium text-gray-600 hover:text-green-800 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {label}{sort.key === key ? (sort.asc ? " ▲" : " ▼") : ""}
    </th>
  );

  const available = plots.filter((p) => p.status === "available").length;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Plot inventory</h2>
        <span className="text-sm text-gray-500">{available} of {plots.length} available</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-gray-50">
            <tr>
              {th("plot_label", "Plot")}
              {th("size_value", "Size")}
              {th("price", "Price", "right")}
              {th("status", "Status")}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((p) => (
              <tr key={p.id} className="bg-white">
                <td className="px-4 py-2.5 text-gray-800">{p.plot_label ?? "—"}</td>
                <td className="px-4 py-2.5 text-gray-600">{p.size_value} {p.size_unit}</td>
                <td className="px-4 py-2.5 text-right font-medium text-green-800">{p.price != null ? formatINRShort(p.price) : "—"}</td>
                <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle[p.status] ?? "bg-gray-100 text-gray-600"}`}>{String(p.status).replace(/_/g, " ")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
