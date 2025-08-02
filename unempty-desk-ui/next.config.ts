import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React strict mode if it's causing double renders
  reactStrictMode: false,

  // Ensure consistent behavior between dev and production
  swcMinify: true,

  // Add experimental features to help with hydration
  experimental: {
    // This can help with hydration issues
    optimizePackageImports: ["lucide-react", "@headlessui/react"],
  },

  // Configure images if you're using external sources
  images: {
    domains: ["localhost"],
    unoptimized: true, // Use this if you're having issues with image optimization
  },

  // Webpack configuration to handle potential module issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure Firebase Auth works properly on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Ensure proper handling of dynamic imports
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
