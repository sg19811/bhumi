import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bhūmi — Trusted agricultural land marketplace";

// Default social share card for pages that don't define their own OG image.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #38461f 0%, #445626 55%, #566d2d 100%)",
          color: "#fdfcf9",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.85 }}>Bhūmi</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 24, maxWidth: 900 }}>
          Find trusted agricultural land
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.9, maxWidth: 860 }}>
          Verified listings · legal clarity · real boundaries on the map
        </div>
      </div>
    ),
    size
  );
}
