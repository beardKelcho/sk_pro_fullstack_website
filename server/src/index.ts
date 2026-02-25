import express from 'express';
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
import { legacyFileHandler } from './middleware/legacyFileHandler';

import { setupExpressErrorHandler } from '@sentry/node';
import { initSentry } from './config/sentry';

// Environment değişkenlerini yapılandır
dotenv.config();

// Sentry'i başlat
initSentry();

// Critical Config Check
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  logger.error('CRITICAL: CLIENT_URL environment variable is not defined!');
  // We don't exit process here to avoid crash loop, but it's a critical configuration error.
}

// Express app oluştur
const app = express();

// Trust Proxy: Render/Vercel arkasında çalışırken IP ve protokolü doğru algılamak için gerekli
app.set('trust proxy', 1);

app.use(cors({
  origin: (origin, callback) => {
    // SECURITY EMERGENCY: Allow ALL origins to prevent blocked requests during debugging
    // To support 'credentials: true', we must return the specific origin, not '*'
    if (!origin) return callback(null, true);
    // Always allow
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable Pre-Flight for all routes
app.options('*', cors());

// HTTP server oluştur (WebSocket ve GraphQL için)
const httpServer = createServer(app);

// CORS Middleware (en önce - Helmet'ten önce)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.CORS_ORIGIN,
  'https://skpro.com.tr',
  'https://www.skpro.com.tr',
  'app://-' // Electron masaüstü uygulaması için izin verilen origin
].filter(Boolean); // undefined/null değerleri filtrele

// Development modunda local network IP'lerine izin ver
const isLocalNetworkOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  // localhost ve local network IP'leri (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
};



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
  })
);

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
app.use(csrfOriginCheck(allowedOrigins as string[]));

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