import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, createCacheKey } from '../utils/cache';
import logger from '../utils/logger';

export interface CacheMiddlewareOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  keyPrefix?: string; // Cache key prefix
  skipCache?: (req: Request) => boolean; // Cache'i atlamak için koşul
  generateKey?: (req: Request & { user?: any }) => string; // Özel cache key oluşturma fonksiyonu
}

/**
 * API response caching middleware
 * GET istekleri için cache kontrolü yapar
 */
export const cacheMiddleware = (options: CacheMiddlewareOptions = {}) => {
  const {
    ttl = 300, // Default 5 dakika
    keyPrefix = 'api',
    skipCache,
    generateKey,
  } = options;

  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    // Sadece GET isteklerini cache'le
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache koşulu varsa kontrol et
    if (skipCache && skipCache(req)) {
      return next();
    }

    try {
      // Cache key oluştur
      const cacheKey = generateKey
        ? generateKey(req)
        : createCacheKey(
            keyPrefix,
            req.path,
            JSON.stringify(req.query),
            req.headers.authorization ? 'auth' : 'public'
          );

      // Cache'den veri getir
      const cached = await getCache<any>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.status(200).json(cached);
      }

      // Cache'de yoksa, response'u yakala ve cache'le
      const originalJson = res.json.bind(res);
      res.json = function (body: any) {
        // Başarılı response'ları cache'le
        if (res.statusCode === 200 && body) {
          setCache(cacheKey, body, ttl).catch((error) => {
            logger.error(`Cache set error for ${cacheKey}:`, error);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      // Hata durumunda cache'i atla
      next();
    }
  };
};

/**
 * Belirli bir resource için cache'i invalidate et
 */
export const invalidateCache = async (
  pattern: string | string[]
): Promise<void> => {
  const { deleteCachePattern } = await import('../utils/cache');
  
  if (Array.isArray(pattern)) {
    await Promise.all(pattern.map((p) => deleteCachePattern(p)));
  } else {
    await deleteCachePattern(pattern);
  }
};

/**
 * Equipment cache'lerini invalidate et
 */
export const invalidateEquipmentCache = async (): Promise<void> => {
  await invalidateCache(['equipment:*', 'api:/api/equipment*', 'dashboard:*']);
};

/**
 * Project cache'lerini invalidate et
 */
export const invalidateProjectCache = async (): Promise<void> => {
  await invalidateCache(['project:*', 'api:/api/projects*', 'dashboard:*']);
};

/**
 * Task cache'lerini invalidate et
 */
export const invalidateTaskCache = async (): Promise<void> => {
  await invalidateCache(['task:*', 'api:/api/tasks*', 'dashboard:*']);
};

/**
 * Dashboard cache'lerini invalidate et
 */
export const invalidateDashboardCache = async (): Promise<void> => {
  await invalidateCache(['dashboard:*', 'api:/api/dashboard*']);
};

