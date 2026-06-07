import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage public URLs:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    // Optimized by Next's built-in optimizer (WebP + responsive sizes) — no paid CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      // Eligibility was folded into the Land Legal Navigator.
      { source: "/eligibility", destination: "/legal", permanent: true },
    ];
  },
};

export default nextConfig;
