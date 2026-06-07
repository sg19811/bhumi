import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/legal/result", "/my-listings", "/my-requirements", "/saved", "/collections", "/agent"] },
    sitemap: "https://bhumi.vercel.app/sitemap.xml",
  };
}
