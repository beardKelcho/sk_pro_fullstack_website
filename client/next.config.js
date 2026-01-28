/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

// Environment check
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn('⚠️  NEXT_PUBLIC_SITE_URL is missing in production! Please add it to your environment variables.');
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '127.0.0.1', 'res.cloudinary.com', 'sk-pro-backend.onrender.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/api/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.*.*',
        port: '5001',
        pathname: '/**',
      },
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Render Backend (Legacy Uploads)
      {
        protocol: 'https',
        hostname: 'sk-pro-backend.onrender.com',
        pathname: '/**',
      },
      // Local network IP ranges
      {
        protocol: 'http',
        hostname: '10.*.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.*.*.*',
        port: '5001',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false, // Production'da optimize et
    minimumCacheTTL: 60, // 60 saniye cache
  },
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ['@vercel/analytics', 'framer-motion'],
  },
  compiler: {
    // Development'ta da console.log ve console.debug'ı kaldır, sadece error ve warn kalsın
    removeConsole: process.env.NODE_ENV === 'production' ? true : {
      exclude: ['error', 'warn'],
    },
  },
  // API rewrites - Backend'i frontend üzerinden proxy et
  rewrites: async () => {
    // Default to Render backend if env var is missing, as requested
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-pro-backend.onrender.com';
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/api-docs/:path*',
          destination: `${backendUrl}/api-docs/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${backendUrl}/uploads/:path*`,
        },
      ],
    };
  },
  redirects: async () => {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'skproduction.com.tr',
          },
        ],
        destination: 'https://skpro.com.tr/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.skproduction.com.tr',
          },
        ],
        destination: 'https://skpro.com.tr/:path*',
        permanent: true,
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob: res.cloudinary.com https://sk-pro-backend.onrender.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://sk-pro-backend.onrender.com *.pusher.com wss://*.pusher.com; media-src 'self' data: https: blob: res.cloudinary.com https://sk-pro-backend.onrender.com; frame-src 'self' https://www.youtube.com https://www.google.com https://vercel.live;"
          }
        ],
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // Bundle analizi için
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      // config.plugins'in var olduğundan ve array olduğundan emin ol
      if (!config.plugins) {
        config.plugins = [];
      }
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    // Production optimizasyonları
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000, // ~240 KB (performance budget için)
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            // Vendor chunks (node_modules)
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              name(module) {
                // Büyük kütüphaneleri ayrı chunk'lara ayır
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                if (packageName) {
                  // Büyük kütüphaneler için ayrı chunk
                  const largeLibs = ['react', 'react-dom', 'next', '@tanstack/react-query', 'recharts', 'react-grid-layout'];
                  if (largeLibs.some(lib => packageName.includes(lib))) {
                    return `vendor-${packageName.replace('@', '').replace('/', '-')}`;
                  }
                }
                return 'vendor';
              },
            },
            // Common chunks
            common: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            // Default
            default: {
              minChunks: 2,
              priority: -30,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }

    return config
  },
}

const configWithIntl = withNextIntl(nextConfig);

// Sentry config (sadece production'da ve DSN varsa)
// SENTRY_ORG ve SENTRY_PROJECT source map upload için gerekli ama opsiyonel
const hasSentryDSN =
  process.env.NODE_ENV === 'production' &&
  (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

// SENTRY_ORG ve SENTRY_PROJECT validation (undefined, null, boş string kontrolü)
const hasSentryOrg = process.env.SENTRY_ORG && process.env.SENTRY_ORG.trim() !== '';
const hasSentryProject = process.env.SENTRY_PROJECT && process.env.SENTRY_PROJECT.trim() !== '';

const hasSentrySourceMapConfig =
  hasSentryDSN &&
  hasSentryOrg &&
  hasSentryProject;

// Sentry webpack plugin options
// Org ve project sadece geçerli değerler varsa ekle (source map upload için gerekli)
const sentryWebpackPluginOptions = {
  // Sentry webpack plugin options
  silent: true, // Suppresses source map uploading logs during build

  // Source maps
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,

  // Automatic release tracking
  automaticVercelReleases: false, // Manuel release tracking kullanıyoruz

  // Org ve project sadece geçerli değerler varsa ekle (source map upload için gerekli)
  // Undefined/null/boş string olursa source map upload devre dışı kalır ama Sentry çalışmaya devam eder
  ...(hasSentryOrg && { org: process.env.SENTRY_ORG }),
  ...(hasSentryProject && { project: process.env.SENTRY_PROJECT }),
  ...(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_AUTH_TOKEN.trim() !== '' && {
    authToken: process.env.SENTRY_AUTH_TOKEN
  }),
};

// Sentry ile wrap et
// - DSN varsa: Sentry aktif (error tracking çalışır)
// - DSN + Org + Project varsa: Sentry aktif + source map upload çalışır
// - Hiçbiri yoksa: Sentry devre dışı
module.exports = configWithIntl; 