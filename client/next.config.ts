import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/dashboard",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/dashboard/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // Proxy /uploads to the backend that serves static uploads. Use backend origin only (no /api path).
  async rewrites() {
    const apiUrl = (process.env.API_URL || process.env.BACKEND_URL || "http://localhost:4000").replace(/\/api\/?$/, "");
    return [{ source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` }];
  },
};

export default nextConfig;
