const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: require("./package.json").version,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  eslint: {
    // ESLint runs separately via `npm run lint` (flat config CLI), not during next build
    ignoreDuringBuilds: true,
  },
  output: "export",
  turbopack: {
    root: path.resolve(__dirname),
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ],
  },
};

module.exports = nextConfig;
