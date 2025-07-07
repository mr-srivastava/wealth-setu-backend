import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
  // Use serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: [],
};

export default nextConfig;
