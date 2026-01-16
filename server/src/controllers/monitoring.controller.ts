import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Session } from '../models';
import logger from '../utils/logger';
import {
  avg,
  getApiMetricsInRange,
  getDbMetricsInRange,
  p95,
  TimeRange,
} from '../utils/monitoring/monitoringStore';
import { rateLimitConfig } from '../middleware/rateLimiters';

const parseTimeRange = (raw: unknown): TimeRange => {
  const v = typeof raw === 'string' ? raw : '';
  if (v === '1h' || v === '24h' || v === '7d' || v === '30d') return v;
  return '24h';
};

export const getMonitoringDashboard = async (req: Request, res: Response) => {
  const timeRange = parseTimeRange(req.query.timeRange);

  try {
    const api = getApiMetricsInRange(timeRange);
    const db = getDbMetricsInRange(timeRange);

    const totalRequests = api.length;
    const errorRequests = api.filter((m) => m.statusCode >= 400).length;
    const successRequests = totalRequests - errorRequests;

    const apiDurations = api.map((m) => m.durationMs);
    const avgApi = avg(apiDurations);
    const p95Api = p95(apiDurations);

    // Slowest endpoints
    const byEndpoint = new Map<string, { endpoint: string; total: number; count: number }>();
    for (const m of api) {
      const key = `${m.method} ${m.path}`;
      const existing = byEndpoint.get(key) || { endpoint: key, total: 0, count: 0 };
      existing.total += m.durationMs;
      existing.count += 1;
      byEndpoint.set(key, existing);
    }
    const slowestEndpoints = Array.from(byEndpoint.values())
      .map((x) => ({
        endpoint: x.endpoint,
        averageTime: x.count ? x.total / x.count : 0,
        requestCount: x.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 8);

    // DB slow queries (top)
    const dbByOp = new Map<string, { key: string; total: number; count: number; max: number }>();
    for (const q of db) {
      const key = `${q.model}.${q.operation}`;
      const existing = dbByOp.get(key) || { key, total: 0, count: 0, max: 0 };
      existing.total += q.durationMs;
      existing.count += 1;
      existing.max = Math.max(existing.max, q.durationMs);
      dbByOp.set(key, existing);
    }
    const slowestQueries = Array.from(dbByOp.values())
      .map((x) => ({
        query: x.key,
        averageTime: x.count ? x.total / x.count : 0,
        maxTime: x.max,
        count: x.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 8);

    // User activity: Session collection (DB varsa)
    let activeUsers = 0;
    let totalSessions = 0;
    let averageSessionDuration = 0;
    try {
      if (mongoose.connection.readyState === 1) {
        const now = new Date();
        const windowMs =
          timeRange === '1h'
            ? 60 * 60 * 1000
            : timeRange === '24h'
              ? 24 * 60 * 60 * 1000
              : timeRange === '7d'
                ? 7 * 24 * 60 * 60 * 1000
                : 30 * 24 * 60 * 60 * 1000;
        const cutoff = new Date(now.getTime() - windowMs);

        const sessions = await Session.find({
          isActive: true,
          lastActivity: { $gte: cutoff },
        })
          .select('userId createdAt lastActivity')
          .lean();

        totalSessions = sessions.length;
        activeUsers = new Set(sessions.map((s) => s.userId.toString())).size;
        const durations = sessions.map((s: any) => {
          const start = new Date(s.createdAt).getTime();
          const end = new Date(s.lastActivity).getTime();
          return Math.max(0, (end - start) / 1000);
        });
        averageSessionDuration = avg(durations);
      }
    } catch (e) {
      logger.warn('Monitoring: session metrics hesaplanamadı', e);
    }

    // Errors (API tabanlı)
    const byErrorKey = new Map<string, { message: string; count: number; last: number }>();
    for (const m of api) {
      if (m.statusCode < 400) continue;
      const key = `${m.method} ${m.path} -> ${m.statusCode}`;
      const existing = byErrorKey.get(key) || { message: key, count: 0, last: 0 };
      existing.count += 1;
      existing.last = Math.max(existing.last, m.ts);
      byErrorKey.set(key, existing);
    }
    const topErrors = Array.from(byErrorKey.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((x) => ({
        message: x.message,
        count: x.count,
        lastOccurred: new Date(x.last || Date.now()).toISOString(),
      }));

    const rateLimited = api.filter((m) => m.statusCode === 429);
    const rateLimitedByEndpoint = new Map<string, number>();
    for (const m of rateLimited) {
      const key = `${m.method} ${m.path}`;
      rateLimitedByEndpoint.set(key, (rateLimitedByEndpoint.get(key) || 0) + 1);
    }
    const topRateLimited = Array.from(rateLimitedByEndpoint.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Performance: Şimdilik API sürelerinden türet (frontend ölçümü yoksa da gerçek bir sinyal)
    const pageLoadEstimateAvg = avgApi ? Math.min(5000, avgApi * 3) : 0;
    const pageLoadEstimateP95 = p95Api ? Math.min(8000, p95Api * 3) : 0;

    return res.status(200).json({
      performance: {
        averagePageLoadTime: pageLoadEstimateAvg,
        averageApiResponseTime: avgApi,
        p95PageLoadTime: pageLoadEstimateP95,
        p95ApiResponseTime: p95Api,
      },
      apiMetrics: {
        totalRequests,
        successRate: totalRequests ? (successRequests / totalRequests) * 100 : 100,
        errorRate: totalRequests ? (errorRequests / totalRequests) * 100 : 0,
        averageResponseTime: avgApi,
        slowestEndpoints,
      },
      userActivity: {
        activeUsers,
        totalSessions,
        averageSessionDuration,
        topPages: [],
      },
      errors: {
        totalErrors: errorRequests,
        errorRate: totalRequests ? (errorRequests / totalRequests) * 100 : 0,
        topErrors,
      },
      rateLimiting: {
        config: rateLimitConfig(),
        totalRateLimited: rateLimited.length,
        topRateLimitedEndpoints: topRateLimited,
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        slowestQueries,
      },
    });
  } catch (error) {
    logger.error('Monitoring dashboard hatası:', error);
    return res.status(500).json({ message: 'Monitoring dashboard verileri alınamadı' });
  }
};

