import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  webpack: (config) => {
    // @react-pdf/renderer uses canvas which is not available in Node.js edge runtime
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
