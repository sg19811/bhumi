"use client";

import { formatINRShort } from "@/app/lib/format";
import { LAND_TYPE_LABELS } from "@/app/lib/land";
import { corridorLabel } from "@/app/lib/farm-plots/corridors";
import { cityLabel } from "@/app/lib/farm-plots/cities";

const humanize = (s?: string | null) => (s ? s.replace(/_/g, " ") : null);

// "Send brochure on WhatsApp" — builds a concise, shareable project summary and
// opens WhatsApp. Useful for developers/agents and for buyers forwarding to family.
export default function ProjectWhatsAppBrochure({ listing }: { listing: Record<string, unknown> }) {
  const g = (k: string) => {
    const v = listing?.[k];
    return v != null && v !== "" ? v : null;
  };

  const buildMessage = () => {
    const name = String(g("project_name") || g("title") || "Farm plot project");
    const place = [corridorLabel(g("corridor") as string | null), cityLabel(g("nearest_city") as string | null)]
      .filter(Boolean)
      .join(", ");
    const landType = LAND_TYPE_LABELS[String(g("land_type"))] ?? null;
    const price = g("price") ? `${formatINRShort(Number(g("price")))}` : null;
    const plotCount = g("plot_count");
    const smin = g("plot_size_min_value");
    const smax = g("plot_size_max_value");
    const unit = g("plot_size_unit") || "";
    const size = smin && smax ? `${smin}–${smax} ${unit}`.trim() : smin ? `${smin} ${unit}`.trim() : null;
    const dist = g("distance_from_city_km");
    const stage = humanize(g("project_stage") as string | null);
    const possession = humanize(g("possession_timeline") as string | null);
    const layout = humanize(g("layout_approval_status") as string | null);
    const conversion = humanize(g("conversion_status") as string | null);
    const url = typeof window !== "undefined" ? window.location.href : "";

    const lines = [
      `🌾 *${name}*${place ? ` — ${place}` : ""}`,
      landType ? landType : null,
      price ? `💰 ${price}` : null,
      plotCount || size ? `📐 ${plotCount ? `${plotCount} plots` : ""}${plotCount && size ? " · " : ""}${size ?? ""}`.trim() : null,
      dist ? `📍 ~${dist} km from city` : null,
      stage || possession ? `🏗 ${[stage && `Stage: ${stage}`, possession && `Possession: ${possession}`].filter(Boolean).join(" · ")}` : null,
      layout || conversion ? `📄 ${[layout && `Layout: ${layout}`, conversion && `Land: ${conversion}`].filter(Boolean).join(" · ")}` : null,
      "",
      `Details & map: ${url}`,
      `_Shared via AcreHub — always verify documents before buying._`,
    ].filter((l) => l !== null);

    return lines.join("\n");
  };

  const onShare = () => {
    const text = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={onShare}
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5d]"
    >
      <span aria-hidden="true">🟢</span> Send brochure on WhatsApp
    </button>
  );
}
