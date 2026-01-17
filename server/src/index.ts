import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import routes from './routes';
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
import { authLimiter, exportLimiter, generalApiLimiter, uploadLimiter, loginLimiter } from './middleware/rateLimiters';
import fs from 'fs';
import path from 'path';
import { initMongooseQueryMonitor } from './utils/monitoring/dbQueryMonitor';

// Environment değişkenlerini yapılandır
dotenv.config();

// Express app oluştur
const app = express();

// CORS Middleware (en önce - Helmet'ten önce)
// ngrok URL'lerini de destekle
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.NGROK_URL,
].filter(Boolean); // undefined/null değerleri filtrele

// Development modunda local network IP'lerine izin ver
const isLocalNetworkOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  // localhost ve local network IP'leri (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    // Origin yoksa (same-origin request) veya allowedOrigins içindeyse izin ver
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.ngrok-free.app') || origin.includes('.ngrok.io')) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production' && isLocalNetworkOrigin(origin)) {
      // Development modunda local network IP'lerine izin ver
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires' // expires header'ını ekle
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));

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
const uploadsDir = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsDir)) {
  // Backward-compat: Bazı eski upload'larda type alanı multipart'ta geç geldiği için dosyalar `general/` altına kaydedilmiş olabilir.
  // Ancak DB'de/URL'de `/uploads/videos/...` veya `/uploads/site-images/...` görünebilir.
  // Bu durumda 404 yerine `general/` altındaki aynı dosyayı servis etmeye çalış.
  app.get('/uploads/:folder/:file(*)', (req, res, next) => {
    try {
      const { folder } = req.params;
      const file = req.params.file;

      // basic traversal guard
      const safeFile = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
      const primaryPath = path.join(uploadsDir, folder, safeFile);

      if (primaryPath.startsWith(uploadsDir) && fs.existsSync(primaryPath)) {
        return next(); // express.static handle etsin
      }

      // Sadece belirli klasörler için fallback uygula
      if (folder === 'videos' || folder === 'site-images') {
        const fallbackPath = path.join(uploadsDir, 'general', safeFile);
        if (fallbackPath.startsWith(uploadsDir) && fs.existsSync(fallbackPath)) {
          return res.sendFile(fallbackPath);
        }
      }

      return next();
    } catch {
      return next();
    }
  });

  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: '1y', // 1 yıl cache
      etag: true, // ETag desteği
      lastModified: true, // Last-Modified header
      setHeaders: (res, filePath) => {
        // Resim ve video dosyaları için özel headers
        const ext = path.extname(filePath).toLowerCase();
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(ext)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          const contentTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          };
          res.setHeader('Content-Type', contentTypes[ext] || 'image/jpeg');
        } else if (/\.(mp4|webm|mov|avi)$/i.test(ext)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Accept-Ranges', 'bytes'); // Video streaming için
          const contentTypes: { [key: string]: string } = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
          };
          res.setHeader('Content-Type', contentTypes[ext] || 'video/mp4');
        }
      },
    })
  );
  logger.info('Uploads klasörü static olarak serve ediliyor: /uploads (optimized)');
} else {
  logger.warn('Uploads klasörü bulunamadı, oluşturuluyor...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
    })
  );
}

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
    // Server'ı önce başlat, MongoDB bağlantısını arka planda yap
    app.listen(PORT, () => {
      logger.info(`Sunucu port ${PORT} üzerinde çalışıyor`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
      logCDNConfig(); // CDN yapılandırmasını logla
    });
    
    // MongoDB bağlantısını arka planda dene (non-blocking)
    connectDB().then(() => {
      logger.info('MongoDB veritabanına bağlandı');
      // DB query metriklerini topla
      initMongooseQueryMonitor();
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