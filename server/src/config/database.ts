import 'dotenv/config';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const RECONNECT_DELAY_MS = 5000;

let reconnectTimer: NodeJS.Timeout | null = null;
let connectionListenersRegistered = false;
let shutdownHandlersRegistered = false;

const scheduleReconnect = () => {
  if (process.env.NODE_ENV === 'test' || reconnectTimer) {
    return;
  }

  logger.warn(`MongoDB için ${RECONNECT_DELAY_MS / 1000} saniye sonra yeniden bağlanma denenecek...`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectDB().catch((retryError) => {
      logger.error('MongoDB yeniden bağlanma denemesi başarısız:', retryError);
    });
  }, RECONNECT_DELAY_MS);

  reconnectTimer.unref();
};

const registerConnectionListeners = () => {
  if (connectionListenersRegistered) {
    return;
  }

  connectionListenersRegistered = true;

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
    scheduleReconnect();
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
};

const registerShutdownHandlers = () => {
  if (shutdownHandlersRegistered) {
    return;
  }

  shutdownHandlersRegistered = true;

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination (SIGINT)');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination (SIGTERM)');
    process.exit(0);
  });
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      logger.info('MongoDB bağlantı girişimi zaten devam ediyor.');
      return mongoose.connection;
    }

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

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

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

    registerConnectionListeners();
    registerShutdownHandlers();

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

    scheduleReconnect();

    throw new AppError('Database connection failed', 500);
  }
};

export default connectDB;
