/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', '127.0.0.1'],
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
      // Local network IP'leri için (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      {
        protocol: 'http',
        hostname: '192.168.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '10.*.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.16.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.17.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.18.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.19.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.20.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.21.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.22.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.23.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.24.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.25.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.26.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.27.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.28.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.29.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.30.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.31.*.*',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ngrok-free.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ngrok.io',
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
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['@vercel/analytics', 'framer-motion'],
  },
  compiler: {
    // Development'ta da console.log ve console.debug'ı kaldır, sadece error ve warn kalsın
    removeConsole: process.env.NODE_ENV === 'production' ? true : {
      exclude: ['error', 'warn'],
    },
  },
  // API rewrites - Backend'i frontend üzerinden proxy et (ngrok için)
  rewrites: async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    return [
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
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
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
module.exports = hasSentryDSN && hasSentrySourceMapConfig
  ? withSentryConfig(configWithIntl, sentryWebpackPluginOptions)
  : hasSentryDSN && !hasSentrySourceMapConfig
  ? (() => {
      // DSN var ama org/project yok - sadece error tracking, source map upload yok
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️  Sentry: DSN found but SENTRY_ORG/SENTRY_PROJECT missing or empty. Source map upload disabled.');
      }
      return configWithIntl;
    })()
  : configWithIntl; 