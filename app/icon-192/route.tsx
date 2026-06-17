import { ImageResponse } from "next/og";

// 192x192 PWA icon.
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
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    { width: 192, height: 192 }
  );
}
