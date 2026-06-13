/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/track.js",
        destination: "/api/track.js",
      },
    ]
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/dashboard", permanent: true },
      { source: "/admin/dashboard", destination: "/dashboard", permanent: true },
      { source: "/admin/campaigns", destination: "/campaigns", permanent: true },
      { source: "/admin/logs", destination: "/logs", permanent: true },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

module.exports = nextConfig
