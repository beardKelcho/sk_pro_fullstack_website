import 'dotenv/config';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const connectDB = async () => {
  try {
    // DB bağlantısı yokken yapılan sorguların 10sn buffer timeout'larına düşmesini engelle
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 0);

    // MONGO_URI veya MONGODB_URI destekle (geriye dönük uyumluluk)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';

    if ((!process.env.MONGO_URI && !process.env.MONGODB_URI)) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('❌ MONGO_URI environment variable is missing in production!');
      } else {
        logger.warn('⚠️  MongoDB URI bulunamadı veya localhost kullanılıyor. MONGO_URI environment variable\'ını kontrol edin.');
      }
    }

    logger.info('MongoDB bağlantısı kuruluyor...');

    // Connection pool ayarlarını environment variable'lardan al
    const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20', 10);
    const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10);
    const maxIdleTimeMS = parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '30000', 10);
    const heartbeatFrequencyMS = parseInt(process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || '10000', 10);

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize, // Maksimum bağlantı sayısı (env'den)
      minPoolSize, // Minimum bağlantı sayısı (env'den)
      serverSelectionTimeoutMS: 30000, // 30 saniye
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Bağlantı timeout'u
      family: 4,
      retryWrites: true,
      w: 'majority',
      // Connection pool optimizasyonları
      maxIdleTimeMS, // Idle kalma süresi (env'den)
      heartbeatFrequencyMS, // Heartbeat sıklığı (env'den)
      // Connection pool monitoring
      monitorCommands: process.env.NODE_ENV === 'development', // Development'ta command monitoring
    });

    // Connection pool istatistiklerini logla
    if (process.env.NODE_ENV === 'development') {
      logger.info(`📊 MongoDB Connection Pool: max=${maxPoolSize}, min=${minPoolSize}, idle=${maxIdleTimeMS}ms, heartbeat=${heartbeatFrequencyMS}ms`);
    }

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      // Test ortamında reconnect yapma (test teardown'da sorun çıkarır)
      if (process.env.NODE_ENV !== 'test') {
        const reconnectTimer = setTimeout(connectDB, 5000);
        // Timer'ı unref et (process'i açık tutmasın - özellikle test ortamında)
        reconnectTimer.unref();
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error: unknown) {
    logger.error('❌ MongoDB bağlantı hatası:', error);

    // Hata detaylarını analiz et
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('IP') || errorMessage.includes('whitelist')) {
      logger.error('');
      logger.error('🔴 SORUN: MongoDB Atlas IP Whitelist hatası!');
      logger.error('');
      logger.error('💡 ÇÖZÜM:');
      logger.error('   1. MongoDB Atlas Dashboard\'a gidin: https://cloud.mongodb.com/');
      logger.error('   2. Network Access → Add IP Address');
      logger.error('   3. Mevcut IP\'nizi ekleyin veya 0.0.0.0/0 (tüm IP\'ler - sadece development için)');
      logger.error('');
      logger.error('📋 Mevcut IP\'nizi öğrenmek için:');
      logger.error('   curl https://api.ipify.org');
      logger.error('');
    } else if (errorMessage.includes('authentication')) {
      logger.error('');
      logger.error('🔴 SORUN: MongoDB kimlik doğrulama hatası!');
      logger.error('');
      logger.error('💡 ÇÖZÜM:');
      logger.error('   - MONGO_URI içindeki kullanıcı adı ve şifreyi kontrol edin');
      logger.error('   - MongoDB Atlas\'ta kullanıcının doğru yetkileri olduğundan emin olun');
      logger.error('');
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      logger.error('');
      logger.error('🔴 SORUN: MongoDB sunucusu bulunamadı!');
      logger.error('');
      logger.error('💡 ÇÖZÜM:');
      logger.error('   - MONGO_URI\'nin doğru olduğundan emin olun');
      logger.error('   - İnternet bağlantınızı kontrol edin');
      logger.error('');
    }

    throw new AppError('Database connection failed', 500);
  }
};

export default connectDB; 