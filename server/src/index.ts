import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import logger from './utils/logger';
import { startScheduledTasks } from './utils/scheduledTasks';
import connectDB from './config/database';
import { connectRedis } from './config/redis';
import { requireDbConnection } from './middleware/requireDbConnection';
import fs from 'fs';
import path from 'path';

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

app.use(cors({
  origin: (origin, callback) => {
    // Origin yoksa (same-origin request) veya allowedOrigins içindeyse izin ver
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.ngrok-free.app') || origin.includes('.ngrok.io')) {
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
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting (OPTIONS isteklerini ve auth endpoint'lerini hariç tut)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 500, // Her IP'den 15 dakikada maksimum 500 istek (development için artırıldı)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // OPTIONS isteklerini, health check'i ve tüm auth endpoint'lerini atla
    return req.method === 'OPTIONS' 
      || req.path === '/api/health'
      || req.path.startsWith('/api/auth');
  },
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Uploads klasörünü static olarak serve et - Optimized
const uploadsDir = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsDir)) {
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
app.use('/api', requireDbConnection, limiter, routes);

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
    });
    
    // MongoDB bağlantısını arka planda dene (non-blocking)
    connectDB().then(() => {
      logger.info('MongoDB veritabanına bağlandı');
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