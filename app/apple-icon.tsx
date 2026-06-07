import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch / larger app icon — brand-green "A".
export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        A
      </div>
    ),
    size
  );
}
