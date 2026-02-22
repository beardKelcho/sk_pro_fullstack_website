import logger from '@/utils/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Optional Redis import - rate limiting will be disabled if not available
let Redis: any;
let redis: any;

try {
  const redisModule = require('@upstash/redis');
  Redis = redisModule.Redis;
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
} catch (error) {
  // Redis not available, rate limiting will be disabled
  logger.warn('@upstash/redis not available, rate limiting disabled');
}

interface RateLimitConfig {
  limit: number;
  window: number; // saniye cinsinden
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth/login': { limit: 5, window: 60 }, // 1 dakikada 5 deneme
  '/api/auth/register': { limit: 3, window: 3600 }, // 1 saatte 3 kayıt
  '/api/performance': { limit: 100, window: 60 }, // 1 dakikada 100 istek
  default: { limit: 1000, window: 60 }, // 1 dakikada 1000 istek
};

export async function middleware(request: NextRequest) {
  // If Redis is not available, skip rate limiting
  if (!redis) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const config = RATE_LIMITS[path] || RATE_LIMITS.default;

  const key = `rate_limit:${ip}:${path}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, config.window);
  }

  if (current > config.limit) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: await redis.ttl(key),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': (await redis.ttl(key)).toString(),
        },
      }
    );
  }

  const response = NextResponse.next();

  // Rate limit bilgilerini header'a ekle
  response.headers.set('X-RateLimit-Limit', config.limit.toString());
  response.headers.set('X-RateLimit-Remaining', (config.limit - current).toString());
  response.headers.set('X-RateLimit-Reset', (Date.now() + config.window * 1000).toString());

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 