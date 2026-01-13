import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const connectDB = async () => {
  try {
    // MONGO_URI veya MONGODB_URI destekle (geriye dönük uyumluluk)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';
    
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/skproduction') {
      logger.warn('⚠️  MongoDB URI bulunamadı veya localhost kullanılıyor. MONGO_URI environment variable\'ını kontrol edin.');
    }
    
    logger.info('MongoDB bağlantısı kuruluyor...');
    
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 20, // Maksimum bağlantı sayısı
      minPoolSize: 5, // Minimum bağlantı sayısı
      serverSelectionTimeoutMS: 30000, // 30 saniye
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Bağlantı timeout'u
      family: 4,
      retryWrites: true,
      w: 'majority',
      // Connection pool optimizasyonları
      maxIdleTimeMS: 30000, // 30 saniye idle kalırsa kapat
      heartbeatFrequencyMS: 10000, // 10 saniyede bir heartbeat
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
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

  } catch (error: any) {
    logger.error('❌ MongoDB bağlantı hatası:', error);
    
    // Hata detaylarını analiz et
    if (error?.message?.includes('IP') || error?.message?.includes('whitelist')) {
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
    } else if (error?.message?.includes('authentication')) {
      logger.error('');
      logger.error('🔴 SORUN: MongoDB kimlik doğrulama hatası!');
      logger.error('');
      logger.error('💡 ÇÖZÜM:');
      logger.error('   - MONGO_URI içindeki kullanıcı adı ve şifreyi kontrol edin');
      logger.error('   - MongoDB Atlas\'ta kullanıcının doğru yetkileri olduğundan emin olun');
      logger.error('');
    } else if (error?.message?.includes('ENOTFOUND') || error?.message?.includes('getaddrinfo')) {
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