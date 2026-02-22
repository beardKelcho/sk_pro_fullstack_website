import logger from '@/utils/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Optional Redis import - if @upstash/redis is not installed, rate limiting will be disabled
let Redis: any;
try {
  Redis = require('@upstash/redis').Redis;
} catch {
  // @upstash/redis not installed
}

const redis = Redis ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null;

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimits: Record<string, RateLimitConfig> = {
  '/api/auth': { maxRequests: 5, windowMs: 60000 }, // 1 dakikada 5 istek
  '/api/contact': { maxRequests: 3, windowMs: 3600000 }, // 1 saatte 3 istek
  '/api/projects': { maxRequests: 100, windowMs: 60000 }, // 1 dakikada 100 istek
  default: { maxRequests: 60, windowMs: 60000 }, // Varsayılan: 1 dakikada 60 istek
};

export async function apiRateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? (request as any).ip ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Rate limit konfigürasyonunu bul
  const config = Object.entries(rateLimits).find(([key]) => path.startsWith(key))?.[1] ?? rateLimits.default;

  // Redis key oluştur
  const key = `rate_limit:${ip}:${path}`;

  // Redis yoksa rate limiting'i atla
  if (!redis) {
    return NextResponse.next();
  }

  try {
    // Mevcut istek sayısını al
    const current = (await redis.get(key) as number) ?? 0;

    // Rate limit kontrolü
    if (current >= config.maxRequests) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + config.windowMs).toString(),
        }
      });
    }

    // İstek sayısını artır
    await redis.incr(key);

    // İlk istekse TTL ayarla
    if (current === 0) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }

    const response = NextResponse.next();

    // Rate limit başlıklarını ekle
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - current - 1).toString());
    response.headers.set('X-RateLimit-Reset', (Date.now() + config.windowMs).toString());

    return response;
  } catch (error) {
    logger.error('Rate limit error:', error);
    // Redis hatası durumunda isteği geçir
    return NextResponse.next();
  }
} 