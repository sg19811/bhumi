import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AcreHub — Agricultural land marketplace",
    short_name: "AcreHub",
    description: "Verified agricultural land, orchards and farmhouse plots — with legal clarity and real boundaries.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfcf9",
    theme_color: "#445626",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "shopping", "lifestyle"],
    orientation: "portrait",
  };
}
