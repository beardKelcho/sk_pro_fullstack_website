import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType | null = null;
let redisDisabledLogged = false;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  try {
    // Dev ortamında Redis opsiyonel: REDIS_URL yoksa default olarak bağlanmayı deneme (log spam + ECONNREFUSED)
    const hasRedisUrl = Boolean(process.env.REDIS_URL);
    const redisEnabled =
      process.env.REDIS_ENABLED !== 'false' && (hasRedisUrl || process.env.NODE_ENV === 'production');

    if (!redisEnabled) {
      if (!redisDisabledLogged) {
        redisDisabledLogged = true;
        logger.warn('Redis devre dışı (REDIS_URL yok veya REDIS_ENABLED=false). Cache kapalı devam ediliyor.');
      }
      return null;
    }

    // Redis URL'i environment variable'dan al (prod'da zorunlu gibi davranıyoruz)
    const redisUrl = process.env.REDIS_URL as string;
    
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
      // Redis down senaryolarında log spam'i azaltmak için warn seviyesinde tutuyoruz
      logger.warn('Redis Client Error:', err);
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

