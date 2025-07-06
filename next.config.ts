import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
  // Disable static optimization for pages that need dynamic data
  experimental: {
    // This helps with build performance
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
