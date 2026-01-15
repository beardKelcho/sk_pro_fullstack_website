import { getRedisClient } from '../config/redis';
import logger from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  keyPrefix?: string; // Cache key prefix
}

/**
 * Cache'den veri getir
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return null; // Redis yoksa null döndür
    }

    // Client'ın açık olup olmadığını kontrol et
    if (!client.isOpen) {
      return null; // Client kapalıysa null döndür
    }

    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error: any) {
    // "The client is closed" hatasını sessizce handle et
    if (error?.message?.includes('closed') || error?.code === 'ECONNREFUSED') {
      return null; // Redis kapalıysa null döndür, hata loglama
    }
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Cache'e veri kaydet
 */
export const setCache = async (
  key: string,
  value: any,
  ttl: number = 300
): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false; // Redis yoksa false döndür
    }

    // Client'ın açık olup olmadığını kontrol et
    if (!client.isOpen) {
      return false; // Client kapalıysa false döndür
    }

    const serialized = JSON.stringify(value);
    await client.setEx(key, ttl, serialized);
    return true;
  } catch (error: any) {
    // "The client is closed" hatasını sessizce handle et
    if (error?.message?.includes('closed') || error?.code === 'ECONNREFUSED') {
      return false; // Redis kapalıysa false döndür, hata loglama
    }
    logger.error(`Cache set error for key ${key}:`, error);
    return false;
  }
};

/**
 * Cache'den veri sil
 */
export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return false;
    }

    await client.del(key);
    return true;
  } catch (error: any) {
    if (error?.message?.includes('closed') || error?.code === 'ECONNREFUSED') {
      return false;
    }
    logger.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
};

/**
 * Pattern'e göre cache'leri sil (örnek: "equipment:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return false;
    }

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error: any) {
    if (error?.message?.includes('closed') || error?.code === 'ECONNREFUSED') {
      return false;
    }
    logger.error(`Cache delete pattern error for ${pattern}:`, error);
    return false;
  }
};

/**
 * Cache key oluştur
 */
export const createCacheKey = (
  prefix: string,
  ...parts: (string | number | undefined)[]
): string => {
  const validParts = parts.filter((part) => part !== undefined && part !== null);
  return `${prefix}:${validParts.join(':')}`;
};

/**
 * Cache'i temizle (tüm cache'i sil)
 */
export const clearCache = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return false;
    }

    await client.flushDb();
    return true;
  } catch (error: any) {
    if (error?.message?.includes('closed') || error?.code === 'ECONNREFUSED') {
      return false;
    }
    logger.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Cache istatistikleri
 */
export const getCacheStats = async (): Promise<{
  connected: boolean;
  keys?: number;
}> => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return { connected: false };
    }

    await client.info('keyspace');
    const keys = await client.dbSize();

    return {
      connected: true,
      keys,
    };
  } catch (error: any) {
    if (error?.message?.includes('closed') || error?.code === 'ECONNREFUSED') {
      return { connected: false };
    }
    logger.error('Cache stats error:', error);
    return { connected: false };
  }
};

