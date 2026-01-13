import express from 'express';
import mongoose from 'mongoose';
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
import fs from 'fs';
import path from 'path';

// Environment değişkenlerini yapılandır
dotenv.config();

// Express app oluştur
const app = express();

// CORS Middleware (en önce - Helmet'ten önce)
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// Uploads klasörünü static olarak serve et
const uploadsDir = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
  logger.info('Uploads klasörü static olarak serve ediliyor: /uploads');
} else {
  logger.warn('Uploads klasörü bulunamadı, oluşturuluyor...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
}

// Swagger API Dokümantasyonu (sadece development'ta)
if (process.env.NODE_ENV === 'development') {
  setupSwagger(app);
}

// API Routeları (rate limiter burada uygulanır)
app.use('/api', limiter, routes);

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
const PORT = process.env.PORT || 5000;

// Logs klasörünü oluştur
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// MongoDB bağlantısı ve Sunucu başlatma
const startServer = async () => {
  try {
    // Database bağlantısı (reconnect logic ile)
    await connectDB();
    
    logger.info('MongoDB veritabanına bağlandı');
    
    app.listen(PORT, () => {
      logger.info(`Sunucu port ${PORT} üzerinde çalışıyor`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Zamanlanmış görevleri başlat
      startScheduledTasks();
    });
  } catch (error) {
    logger.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

startServer(); 