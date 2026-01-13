import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  try {
    // Redis URL'i environment variable'dan al, yoksa default kullan
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Redis client oluştur
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis bağlantısı kurulamadı, cache devre dışı');
            return new Error('Redis bağlantısı başarısız');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    // Hata yönetimi
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis bağlantısı kuruldu');
    });

    redisClient.on('ready', () => {
      logger.info('Redis hazır');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis yeniden bağlanıyor...');
    });

    // Redis'e bağlan
    await redisClient.connect();
    
    logger.info('Redis başarıyla bağlandı');
    return redisClient;
  } catch (error) {
    logger.warn('Redis bağlantısı kurulamadı, cache devre dışı:', error);
    // Redis yoksa uygulama çalışmaya devam etsin
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis bağlantısı kapatıldı');
    } catch (error) {
      logger.error('Redis bağlantısı kapatılırken hata:', error);
    }
    redisClient = null;
  }
};

// Graceful shutdown için
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

export default redisClient;

