const path = require('path');
const packageJson = require('./package.json');

const nextVersion = packageJson.dependencies?.next || '0.0.0';
const nextMajorVersion = Number.parseInt(
  String(nextVersion).replace(/^[^\d]*/, '').split('.')[0] || '0',
  10
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: require("./package.json").version,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
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

if (Number.isFinite(nextMajorVersion) && nextMajorVersion < 16) {
  nextConfig.eslint = {
    // Next 15 still reads this flag during build. Next 16 removed the option.
    ignoreDuringBuilds: true,
  };
}

module.exports = nextConfig;
