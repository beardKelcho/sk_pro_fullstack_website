import logger from '@/utils/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cache, invalidateCache } from '@/utils/cache';

interface CacheMiddlewareOptions {
  ttl?: number;
  tags?: string[];
  excludePaths?: string[];
  includePaths?: string[];
}

const DEFAULT_OPTIONS: CacheMiddlewareOptions = {
  ttl: 3600, // 1 saat
  excludePaths: ['/api/auth', '/api/admin'],
  includePaths: ['/api/products', '/api/categories'],
};

export async function cacheMiddleware(
  request: NextRequest,
  options: CacheMiddlewareOptions = {}
) {
  const { ttl, tags, excludePaths, includePaths } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const path = request.nextUrl.pathname;

  // Cache'lenmeyecek path'leri kontrol et
  if (excludePaths?.some(excludePath => path.startsWith(excludePath))) {
    return NextResponse.next();
  }

  // Cache'lenecek path'leri kontrol et
  if (includePaths && !includePaths.some(includePath => path.startsWith(includePath))) {
    return NextResponse.next();
  }

  // Cache key oluştur
  const cacheKey = `route:${path}`;

  try {
    // Cache'den veriyi al
    const cachedResponse = cache.get<any>(cacheKey);
    if (cachedResponse) {
      return new NextResponse(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: new Headers(cachedResponse.headers),
      });
    }

    // Cache'de yoksa, orijinal isteği işle
    const response = NextResponse.next();

    // Response'u cache'e kaydet
    const responseClone = response.clone();
    const responseBody = await responseClone.text();
    
    cache.set(
      cacheKey,
      {
        body: responseBody,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      },
      { ttl, tags }
    );

    return response;
  } catch (error) {
    logger.error('Cache middleware error:', error);
    return NextResponse.next();
  }
}

// Cache invalidation middleware
export async function cacheInvalidationMiddleware(
  request: NextRequest,
  options: CacheMiddlewareOptions = {}
) {
  const { tags } = options;

  // POST, PUT, DELETE isteklerinde cache'i temizle
  if (['POST', 'PUT', 'DELETE'].includes(request.method) && tags) {
    try {
      await Promise.all(tags.map(tag => invalidateCache.byTag(tag)));
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  return NextResponse.next();
}

// Cache kontrol middleware
export async function cacheControlMiddleware(
  request: NextRequest,
  options: CacheMiddlewareOptions = {}
) {
  const response = NextResponse.next();

  // Cache-Control header'ını ayarla
  response.headers.set(
    'Cache-Control',
    `public, max-age=${options.ttl || DEFAULT_OPTIONS.ttl}, s-maxage=${options.ttl || DEFAULT_OPTIONS.ttl}`
  );

  return response;
} 