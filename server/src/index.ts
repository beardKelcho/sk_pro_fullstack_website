import type { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createServer } from 'http';
import routes from './routes';
import { initWebSocket } from './config/websocket';
import { initGraphQL } from './config/graphql';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import logger from './utils/logger';
import { logCDNConfig } from './config/cdn';
import { startScheduledTasks } from './utils/scheduledTasks';
import connectDB from './config/database';
import { connectRedis } from './config/redis';
import { requireDbConnection } from './middleware/requireDbConnection';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { mongoSanitize } from './middleware/mongoSanitize';
import { csrfOriginCheck } from './middleware/csrfOriginCheck';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { apiVersioning } from './middleware/apiVersioning';
import { authLimiter, exportLimiter, generalApiLimiter, uploadLimiter } from './middleware/rateLimiters';
import fs from 'fs';
import path from 'path';
import { initMongooseQueryMonitor } from './utils/monitoring/dbQueryMonitor';
import { detectSlowQueries } from './utils/queryOptimizer';
import { getAllowedClientOrigins, getPrimaryClientOrigin } from './config/clientOrigins';
// Removed unused legacyFileHandler

import { setupExpressErrorHandler } from '@sentry/node';
import { initSentry } from './config/sentry';

// Environment değişkenlerini yapılandır
dotenv.config();

// Sentry'i başlat
initSentry();

// Express must be loaded after Sentry init so Sentry can instrument it.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express') as typeof import('express');

// Critical Config Check
if (process.env.NODE_ENV === 'production' && !getPrimaryClientOrigin()) {
  logger.error('CRITICAL: FRONTEND_URL veya CLIENT_URL environment variable tanımlı değil!');
  // We don't exit process here to avoid crash loop, but it's a critical configuration error.
}

// Express app oluştur
const app: Express = express();

// Trust Proxy: Render/Vercel arkasında çalışırken IP ve protokolü doğru algılamak için gerekli
app.set('trust proxy', 1);

const corsAllowedOrigins = getAllowedClientOrigins();

// Vercel preview/deployment URL pattern (her deploy farklı hash üretir)
const VERCEL_ORIGIN_REGEX = /^https:\/\/sk-pro-fullstack-website[a-z0-9-]*\.vercel\.app$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsAllowedOrigins.includes(origin) || VERCEL_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }
    logger.warn(`CORS: İzinsiz origin engellendi: ${origin}`);
    return callback(new Error(`CORS politikası: ${origin} kaynağına izin verilmiyor`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-vercel-skip-toolbar'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Enable Pre-Flight for all routes
app.options('*', cors(corsOptions));

// HTTP server oluştur (WebSocket ve GraphQL için)
const httpServer = createServer(app);

// Security Middleware
app.use(
  helmet({
    // API servisi olduğu için CSP'yi prod'da sıkı, dev'de kapalı tutuyoruz (swagger/dev tooling kırılmasın)
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? {
          directives: {
            defaultSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'none'"],
            formAction: ["'none'"],
          },
        }
        : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // HTTPS prod'da HSTS
    hsts:
      process.env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    // Tarayıcı özelliklerini kısıtla (kamera, mikrofon, konum vb.)
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  })
);

// Permissions-Policy: Tarayıcı API'lerini kısıtla
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()'
  );
  next();
});

// Rate limiting: endpoint bazlı limitler
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/export', exportLimiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Request correlation id (log correlation)
app.use(requestIdMiddleware);
// NoSQL injection'e karşı request temizliği
app.use(mongoSanitize);
// CSRF mitigasyonu: state-changing isteklerde origin allowlist kontrolü
app.use(csrfOriginCheck(corsAllowedOrigins, [VERCEL_ORIGIN_REGEX]));

// API versioning (header/accept tabanlı; default v1)
app.use('/api', apiVersioning);

// Uploads klasörünü static olarak serve et - Optimized
// Uploads klasörünü static olarak serve et - STRICT MOD: Kapalı (Legacy destek için yorum satırı)
/* 
const uploadsDir = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir)); 
}
*/
logger.info('Strict Cloudinary Mode Active: Local static file serving is DISABLED.');

// Swagger API Dokümantasyonu
setupSwagger(app);

// API Routeları (rate limiter burada uygulanır)
app.use('/api', metricsMiddleware, requireDbConnection, generalApiLimiter, routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint bulunamadı'
  });
});

// Sentry Error Handler - Custom error handler'dan önce olmalı
setupExpressErrorHandler(app);

// Error handler middleware (en sonda olmalı)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5001;

// Logs klasörünü oluştur
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// MongoDB bağlantısı ve Sunucu başlatma
const startServer = async () => {
  try {
    // WebSocket server'ı başlat
    if (process.env.ENABLE_WEBSOCKET === 'true') {
      initWebSocket(httpServer);
      logger.info('✅ WebSocket server aktif');
    }

    // GraphQL server'ı başlat
    const graphqlServer = await initGraphQL(httpServer, app);
    if (graphqlServer) {
      logger.info('✅ GraphQL server aktif');
    }

    // HTTP server'ı başlat
    httpServer.listen(PORT, () => {
      logger.info(`Sunucu port ${PORT} üzerinde çalışıyor`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
      if (process.env.ENABLE_GRAPHQL === 'true') {
        logger.info(`GraphQL: http://localhost:${PORT}/graphql`);
      }
      logCDNConfig(); // CDN yapılandırmasını logla
      if (process.env.STORAGE_TYPE === 'cloudinary') {
        logger.info('☁️  Cloudinary storage active');
      }
    });

    // MongoDB bağlantısını arka planda dene (non-blocking)
    connectDB().then(async () => {
      logger.info('MongoDB veritabanına bağlandı');

      // Bootstrap System Settings
      const { bootstrapSystemSettings } = await import('./utils/bootstrap');
      await bootstrapSystemSettings();

      // DB query metriklerini topla
      initMongooseQueryMonitor();
      // Slow query detection (development'ta)
      if (process.env.NODE_ENV === 'development' && process.env.DEBUG_SLOW_QUERIES === 'true') {
        detectSlowQueries(1000); // 1 saniyeden uzun sorguları logla
        logger.info('🔍 Slow query detection enabled (threshold: 1000ms)');
      }
      // MongoDB bağlandıktan sonra zamanlanmış görevleri başlat
      startScheduledTasks();
    }).catch((dbError) => {
      logger.error('MongoDB bağlantısı başarısız:', dbError);
      logger.warn('⚠️  API endpoint\'leri çalışmayabilir. MongoDB bağlantısını kontrol edin.');
      logger.warn('💡 MongoDB Atlas IP whitelist\'e mevcut IP\'nizi ekleyin: https://www.mongodb.com/docs/atlas/security-whitelist/');
    });

    // Redis bağlantısı (opsiyonel - yoksa uygulama çalışmaya devam eder)
    connectRedis().catch((redisError) => {
      logger.warn('Redis bağlantısı başarısız (opsiyonel):', redisError);
    });

  } catch (error) {
    logger.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

startServer(); 
