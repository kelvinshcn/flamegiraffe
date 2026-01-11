import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/flamegiraffe",
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
