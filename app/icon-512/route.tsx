import { ImageResponse } from "next/og";

// 512x512 PWA icon (maskable-safe: solid brand background fills the safe zone).
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#445626",
          color: "#fdfcf9",
          fontSize: 300,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    { width: 512, height: 512 }
  );
}
