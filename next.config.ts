import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/payment/success",
        destination: "/payment-success",
      },
      {
        source: "/payment/fail",
        destination: "/payment-failed",
      },
      {
        source: "/payment/failed",
        destination: "/payment-failed",
      },
    ];
  },
};

export default nextConfig;
