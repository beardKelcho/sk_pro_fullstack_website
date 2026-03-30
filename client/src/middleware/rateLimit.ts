import logger from '@/utils/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RedisLike = {
  incr: (key: string) => Promise<number>;
  expire: (key: string, ttl: number) => Promise<unknown>;
  ttl: (key: string) => Promise<number>;
};

let redisClientPromise: Promise<RedisLike | null> | null = null;

const getRedisClient = async (): Promise<RedisLike | null> => {
  if (redisClientPromise) {
    return redisClientPromise;
  }

  redisClientPromise = (async () => {
    try {
      const redisModule = await import('@upstash/redis');
      return new redisModule.Redis({
        url: process.env.UPSTASH_REDIS_REST_URL || '',
        token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
      }) as RedisLike;
    } catch {
      logger.warn('@upstash/redis not available, rate limiting disabled');
      return null;
    }
  })();

  return redisClientPromise;
};

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
  const redis = await getRedisClient();
  if (!redis) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const config = RATE_LIMITS[path] || RATE_LIMITS.default;

  const key = `rate_limit:${ip}:${path}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, config.window);
  }

  if (current > config.limit) {
    const retryAfter = await redis.ttl(key);
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
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
