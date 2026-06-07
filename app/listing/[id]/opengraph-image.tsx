import { ImageResponse } from "next/og";
import { supabase } from "@/app/lib/supabase";
import { formatINRShort } from "@/app/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AcreHub listing";

// Branded social-share card for a listing (WhatsApp/Twitter/etc.).
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: l } = await supabase
    .from("listings")
    .select("title, price, price_basis, area_value, area_unit, village, taluka, district, land_type")
    .eq("id", id)
    .maybeSingle();

  const title = l?.title ?? "Agricultural land on AcreHub";
  const location = l ? [l.village, l.taluka, l.district].filter(Boolean).join(", ") : "";
  const price = l ? formatINRShort(l.price) : "";
  const basis = l?.price_basis === "per_acre" ? "/acre" : l?.price_basis === "per_guntha" ? "/guntha" : l?.price_basis === "per_sqft" ? "/sq ft" : "";
  const area = l ? `${l.area_value} ${l.area_unit}` : "";
  const type = l?.land_type ? String(l.land_type).replace(/_/g, " ") : "";

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(135deg,#445626 0%,#38461f 100%)", padding: 64, color: "#fdfcf9", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>
          🌿 AcreHub
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.05, maxWidth: 1000 }}>{title.slice(0, 90)}</div>
          {location ? <div style={{ marginTop: 16, fontSize: 32, color: "#cedbb2" }}>📍 {location}</div> : null}
          <div style={{ marginTop: 24, display: "flex", gap: 28, fontSize: 34, color: "#e6edd6" }}>
            {price ? <span style={{ fontWeight: 700, color: "#fff" }}>{price}{basis}</span> : null}
            {area ? <span>· {area}</span> : null}
            {type ? <span style={{ textTransform: "capitalize" }}>· {type}</span> : null}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#aec283" }}>
          Verified land · real boundaries · legal clarity
        </div>
      </div>
    ),
    { ...size }
  );
}
