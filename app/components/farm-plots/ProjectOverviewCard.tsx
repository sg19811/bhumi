import { formatINRShort } from "@/app/lib/format";
import CorridorBadge from "@/app/components/farm-plots/CorridorBadge";
import VerificationBadge from "@/app/components/farm-plots/VerificationBadge";

const humanize = (s?: string | null) => (s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null);

// All reads are null-safe — columns may not exist until the migration is applied.
export default function ProjectOverviewCard({ listing }: { listing: Record<string, unknown> }) {
  const num = (k: string) => { const v = listing?.[k]; return typeof v === "number" ? v : v != null && v !== "" ? Number(v) : null; };
  const str = (k: string) => { const v = listing?.[k]; return v ? String(v) : null; };

  const acres = num("total_project_acres");
  const plotCount = num("plot_count");
  const smin = num("plot_size_min_value");
  const smax = num("plot_size_max_value");
  const sizeUnit = str("plot_size_unit");
  const stage = humanize(str("project_stage"));
  const possession = humanize(str("possession_timeline"));
  const distance = num("distance_from_city_km");
  const travel = num("travel_time_minutes");
  const maintAmount = num("maintenance_fee_amount");
  const maintPeriod = str("maintenance_fee_period");
  const layout = humanize(str("layout_approval_status"));
  const conversion = humanize(str("conversion_status"));

  const plotRange = smin && smax ? `${smin}–${smax} ${sizeUnit ?? ""}`.trim() : smin ? `${smin} ${sizeUnit ?? ""}`.trim() : null;
  const distanceText = distance ? `${distance} km${travel ? ` · ${travel} min` : ""}` : travel ? `${travel} min` : null;

  const stats: { label: string; value: string }[] = [];
  if (acres) stats.push({ label: "Total area", value: `${acres} acres` });
  if (plotCount) stats.push({ label: "Plots", value: String(plotCount) });
  if (plotRange) stats.push({ label: "Plot sizes", value: plotRange });
  if (stage) stats.push({ label: "Stage", value: stage });
  if (possession) stats.push({ label: "Possession", value: possession });
  if (distanceText) stats.push({ label: "From city", value: distanceText });
  if (maintAmount) stats.push({ label: "Maintenance", value: `${formatINRShort(maintAmount)}${maintPeriod ? ` / ${maintPeriod.replace(/_/g, " ")}` : ""}` });
  if (layout) stats.push({ label: "Layout approval", value: layout });
  if (conversion) stats.push({ label: "Conversion", value: conversion });

  const corridor = str("corridor");
  const projectName = str("project_name");

  if (stats.length === 0 && !projectName && !corridor) return null;

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{projectName ? projectName : "Project overview"}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge tier={str("verification_tier")} />
          {corridor && <CorridorBadge slug={corridor} />}
        </div>
      </div>
      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-green-50 p-3 text-center">
              <p className="text-base font-bold text-green-800">{s.value}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Project details will appear here once the developer adds them.</p>
      )}
    </section>
  );
}
