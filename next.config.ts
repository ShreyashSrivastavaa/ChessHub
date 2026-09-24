import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/**": ["./prisma/dev.db", "./prisma/schema.prisma"],
  },
};

export default nextConfig;
