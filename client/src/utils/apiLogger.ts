import logger from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

// Optional Redis import - logging will be disabled if not available
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
  // Redis not available, logging will be disabled
  logger.warn('@upstash/redis not available, API logging disabled');
}

interface ApiLog {
  timestamp: number;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: any;
  responseStatus: number;
  responseTime: number;
  ip: string;
  userAgent: string;
}

export class ApiLogger {
  private static instance: ApiLogger;
  private readonly maxLogs: number = 1000;
  private readonly logTTL: number = 7 * 24 * 60 * 60; // 7 gün

  private constructor() { }

  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  async logRequest(request: NextRequest, response: NextResponse, responseTime: number) {
    if (!redis) return; // Redis not available, skip logging

    try {
      const log: ApiLog = {
        timestamp: Date.now(),
        method: request.method,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams),
        headers: Object.fromEntries(request.headers),
        responseStatus: response.status,
        responseTime,
        ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown',
        userAgent: request.headers.get('user-agent') ?? 'unknown',
      };

      // Request body'yi logla (varsa)
      if (request.method !== 'GET') {
        try {
          const body = await request.clone().json();
          log.body = body;
        } catch (error) {
          // Body parse edilemezse loglama
        }
      }

      // Log'u Redis'e kaydet
      const key = `api_logs:${Date.now()}`;
      await redis.set(key, JSON.stringify(log), { ex: this.logTTL });

      // Log sayısını kontrol et ve gerekirse eski logları temizle
      await this.cleanupOldLogs();
    } catch (error) {
      logger.error('API log error:', error);
    }
  }

  private async cleanupOldLogs() {
    if (!redis) return; // Redis not available, skip cleanup

    try {
      const keys = await redis.keys('api_logs:*');
      if (keys.length > this.maxLogs) {
        // En eski logları sil
        const sortedKeys = keys.sort();
        const keysToDelete = sortedKeys.slice(0, keys.length - this.maxLogs);
        await redis.del(...keysToDelete);
      }
    } catch (error) {
      logger.error('Log cleanup error:', error);
    }
  }

  async getLogs(options: {
    startDate?: number;
    endDate?: number;
    method?: string;
    path?: string;
    status?: number;
    limit?: number;
  } = {}): Promise<ApiLog[]> {
    if (!redis) return []; // Redis not available, return empty array

    try {
      const keys = await redis.keys('api_logs:*');
      const logs: ApiLog[] = [];

      for (const key of keys) {
        const log = await redis.get(key);
        if (log) {
          const parsedLog = typeof log === 'string' ? JSON.parse(log) : log;
          if (this.matchesFilters(parsedLog, options)) {
            logs.push(parsedLog);
          }
        }
      }

      // Tarihe göre sırala
      logs.sort((a, b) => b.timestamp - a.timestamp);

      // Limit uygula
      return options.limit ? logs.slice(0, options.limit) : logs;
    } catch (error) {
      logger.error('Get logs error:', error);
      return [];
    }
  }

  private matchesFilters(log: ApiLog, options: {
    startDate?: number;
    endDate?: number;
    method?: string;
    path?: string;
    status?: number;
  }): boolean {
    if (options.startDate && log.timestamp < options.startDate) return false;
    if (options.endDate && log.timestamp > options.endDate) return false;
    if (options.method && log.method !== options.method) return false;
    if (options.path && !log.path.includes(options.path)) return false;
    if (options.status && log.responseStatus !== options.status) return false;
    return true;
  }

  async getStats(): Promise<{
    totalRequests: number;
    averageResponseTime: number;
    statusCodes: Record<number, number>;
    methods: Record<string, number>;
    paths: Record<string, number>;
  }> {
    try {
      const logs = await this.getLogs();

      const stats = {
        totalRequests: logs.length,
        averageResponseTime: 0,
        statusCodes: {} as Record<number, number>,
        methods: {} as Record<string, number>,
        paths: {} as Record<string, number>,
      };

      let totalResponseTime = 0;

      logs.forEach(log => {
        totalResponseTime += log.responseTime;

        // Status code istatistikleri
        stats.statusCodes[log.responseStatus] = (stats.statusCodes[log.responseStatus] || 0) + 1;

        // Method istatistikleri
        stats.methods[log.method] = (stats.methods[log.method] || 0) + 1;

        // Path istatistikleri
        stats.paths[log.path] = (stats.paths[log.path] || 0) + 1;
      });

      stats.averageResponseTime = logs.length > 0 ? totalResponseTime / logs.length : 0;

      return stats;
    } catch (error) {
      logger.error('Get stats error:', error);
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        statusCodes: {},
        methods: {},
        paths: {},
      };
    }
  }
} 