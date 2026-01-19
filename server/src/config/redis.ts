import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType | null = null;
let redisDisabledLogged = false;
let redisConnectFailedLogged = false;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const redisEnabledFlag = process.env.REDIS_ENABLED !== 'false';

    // Dev ortamında Redis opsiyonel: REDIS_URL yoksa localhost'u dene (Redis çalışmıyorsa sessizce cache'i kapat).
    // Prod ortamında REDIS_URL beklenir; yoksa cache devre dışı kalır ve uyarı basılır.
    const redisUrl =
      process.env.REDIS_URL || (!isProd ? 'redis://127.0.0.1:6379' : undefined);
    const redisEnabled = redisEnabledFlag && Boolean(redisUrl);

    if (!redisEnabled) {
      if (!redisDisabledLogged) {
        redisDisabledLogged = true;
        // Dev'de Redis opsiyonel olduğundan warn yerine info kullan (gürültüyü azalt).
        const msg = 'Redis devre dışı (REDIS_URL yok veya REDIS_ENABLED=false). Cache kapalı devam ediliyor.';
        if (isProd) logger.warn(msg);
        else logger.info(msg);
      }
      return null;
    }

    // Redis URL'i environment variable'dan al (prod'da zorunlu gibi davranıyoruz)
    const resolvedRedisUrl = redisUrl as string;
    
    // Redis client oluştur
    redisClient = createClient({
      url: resolvedRedisUrl,
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
    // Dev ortamında Redis opsiyonel: bağlantı yoksa log spam yapma.
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Redis bağlantısı kurulamadı, cache devre dışı:', error);
    } else if (!redisConnectFailedLogged) {
      redisConnectFailedLogged = true;
      logger.info('Redis bağlantısı kurulamadı (dev için opsiyonel). Cache kapalı devam ediliyor.');
    }
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

