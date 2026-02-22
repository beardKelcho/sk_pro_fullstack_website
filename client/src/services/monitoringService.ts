import logger from '@/utils/logger';
/**
 * Monitoring Service
 * Production monitoring ve performance metrics için
 * 
 * @module services/monitoringService
 * @description Performance metrics, API response times, user activity tracking
 */

import apiClient from './api/axios';
import { useQuery } from '@tanstack/react-query';
import { CacheStrategies, QueryKeys } from '@/config/queryConfig';

/**
 * Performance metrikleri interface'i
 * @interface PerformanceMetrics
 */
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

/**
 * API response time metrikleri
 * @interface ApiResponseMetrics
 */
export interface ApiResponseMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  error?: string;
}

/**
 * User activity metrikleri
 * @interface UserActivityMetrics
 */
export interface UserActivityMetrics {
  userId: string;
  sessionId: string;
  pageViews: number;
  actions: number;
  duration: number;
  timestamp: string;
}

/**
 * Monitoring dashboard verileri
 * @interface MonitoringDashboardData
 */
export interface MonitoringDashboardData {
  performance: {
    averagePageLoadTime: number;
    averageApiResponseTime: number;
    p95PageLoadTime: number;
    p95ApiResponseTime: number;
  };
  apiMetrics: {
    totalRequests: number;
    successRate: number;
    errorRate: number;
    averageResponseTime: number;
    slowestEndpoints: Array<{
      endpoint: string;
      averageTime: number;
      requestCount: number;
    }>;
  };
  userActivity: {
    activeUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    topPages: Array<{
      path: string;
      views: number;
    }>;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
    topErrors: Array<{
      message: string;
      count: number;
      lastOccurred: string;
    }>;
  };
  database?: {
    status: 'connected' | 'disconnected' | string;
    slowestQueries?: Array<{
      query: string;
      averageTime: number;
      maxTime: number;
      count: number;
    }>;
  };
  rateLimiting?: {
    config: {
      windowMs: number;
      generalMax: number;
      authMax: number;
      uploadMax: number;
      exportMax: number;
    };
    totalRateLimited: number;
    topRateLimitedEndpoints: Array<{ endpoint: string; count: number }>;
  };
}

/**
 * Performance metriklerini API'den çeker
 * 
 * @param timeRange - Zaman aralığı (hours, days, weeks)
 * @param startDate - Başlangıç tarihi (opsiyonel)
 * @param endDate - Bitiş tarihi (opsiyonel)
 * @returns Performance metrikleri
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const metrics = await getPerformanceMetrics('24h');
 * logger.info(metrics.averagePageLoadTime);
 * ```
 */
export const getPerformanceMetrics = async (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  startDate?: string,
  endDate?: string
): Promise<PerformanceMetrics[]> => {
  try {
    const params: Record<string, string> = { timeRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await apiClient.get('/monitoring/performance', { params });
    return res.data.metrics || [];
  } catch (error: any) {
    // Backend endpoint henüz yoksa mock data döndür
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      return getMockPerformanceMetrics(timeRange);
    }
    throw new Error('Performance metrikleri alınamadı');
  }
};

/**
 * API response time metriklerini çeker
 * 
 * @param timeRange - Zaman aralığı
 * @param endpoint - Belirli endpoint (opsiyonel)
 * @returns API response time metrikleri
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const apiMetrics = await getApiResponseMetrics('24h');
 * logger.info(apiMetrics[0].responseTime);
 * ```
 */
export const getApiResponseMetrics = async (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  endpoint?: string
): Promise<ApiResponseMetrics[]> => {
  try {
    const params: Record<string, string> = { timeRange };
    if (endpoint) params.endpoint = endpoint;

    const res = await apiClient.get('/monitoring/api-metrics', { params });
    return res.data.metrics || [];
  } catch (error: any) {
    // Backend endpoint henüz yoksa mock data döndür
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      return getMockApiResponseMetrics(timeRange);
    }
    throw new Error('API metrikleri alınamadı');
  }
};

/**
 * User activity metriklerini çeker
 * 
 * @param timeRange - Zaman aralığı
 * @param userId - Belirli kullanıcı (opsiyonel)
 * @returns User activity metrikleri
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const activity = await getUserActivityMetrics('24h');
 * logger.info(activity[0].pageViews);
 * ```
 */
export const getUserActivityMetrics = async (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  userId?: string
): Promise<UserActivityMetrics[]> => {
  try {
    const params: Record<string, string> = { timeRange };
    if (userId) params.userId = userId;

    const res = await apiClient.get('/monitoring/user-activity', { params });
    return res.data.metrics || [];
  } catch (error: any) {
    // Backend endpoint henüz yoksa mock data döndür
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      return getMockUserActivityMetrics(timeRange);
    }
    throw new Error('User activity metrikleri alınamadı');
  }
};

/**
 * Monitoring dashboard verilerini çeker
 * Tüm metrikleri tek seferde getirir
 * 
 * @param timeRange - Zaman aralığı
 * @returns Monitoring dashboard verileri
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const dashboard = await getMonitoringDashboard('24h');
 * logger.info(dashboard.performance.averagePageLoadTime);
 * logger.info(dashboard.apiMetrics.successRate);
 * ```
 */
export const getMonitoringDashboard = async (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
): Promise<MonitoringDashboardData> => {
  try {
    const res = await apiClient.get('/monitoring/dashboard', {
      params: { timeRange },
    });
    return res.data;
  } catch (error: any) {
    // Backend endpoint henüz yoksa mock data döndür
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      return getMockMonitoringDashboard(timeRange);
    }
    throw new Error('Monitoring dashboard verileri alınamadı');
  }
};

/**
 * Mock performance metrics (backend endpoint yoksa kullanılır)
 * @private
 */
function getMockPerformanceMetrics(timeRange: '1h' | '24h' | '7d' | '30d'): PerformanceMetrics[] {
  const now = Date.now();
  const rangeMs = timeRange === '1h' ? 3600000 : timeRange === '24h' ? 86400000 : timeRange === '7d' ? 604800000 : 2592000000;
  const points = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;

  return Array.from({ length: points }, (_, i) => ({
    pageLoadTime: 800 + Math.random() * 400,
    apiResponseTime: 150 + Math.random() * 100,
    renderTime: 200 + Math.random() * 150,
    memoryUsage: 50 + Math.random() * 30,
    cpuUsage: 20 + Math.random() * 40,
  }));
}

/**
 * Mock API response metrics (backend endpoint yoksa kullanılır)
 * @private
 */
function getMockApiResponseMetrics(timeRange: '1h' | '24h' | '7d' | '30d'): ApiResponseMetrics[] {
  const endpoints = ['/api/equipment', '/api/projects', '/api/tasks', '/api/users', '/api/dashboard/stats'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];

  return Array.from({ length: 50 }, () => ({
    endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
    method: methods[Math.floor(Math.random() * methods.length)],
    responseTime: 100 + Math.random() * 300,
    statusCode: Math.random() > 0.1 ? 200 : [400, 401, 403, 404, 500][Math.floor(Math.random() * 5)],
    timestamp: new Date(Date.now() - Math.random() * (timeRange === '1h' ? 3600000 : timeRange === '24h' ? 86400000 : timeRange === '7d' ? 604800000 : 2592000000)).toISOString(),
  }));
}

/**
 * Mock user activity metrics (backend endpoint yoksa kullanılır)
 * @private
 */
function getMockUserActivityMetrics(timeRange: '1h' | '24h' | '7d' | '30d'): UserActivityMetrics[] {
  return Array.from({ length: 10 }, (_, i) => ({
    userId: `user${i + 1}`,
    sessionId: `session${i + 1}`,
    pageViews: Math.floor(Math.random() * 50) + 1,
    actions: Math.floor(Math.random() * 100) + 10,
    duration: Math.floor(Math.random() * 3600000) + 60000, // 1 dakika - 1 saat
    timestamp: new Date(Date.now() - Math.random() * (timeRange === '1h' ? 3600000 : timeRange === '24h' ? 86400000 : timeRange === '7d' ? 604800000 : 2592000000)).toISOString(),
  }));
}

/**
 * Mock monitoring dashboard data (backend endpoint yoksa kullanılır)
 * @private
 */
function getMockMonitoringDashboard(timeRange: '1h' | '24h' | '7d' | '30d'): MonitoringDashboardData {
  return {
    performance: {
      averagePageLoadTime: 850,
      averageApiResponseTime: 180,
      p95PageLoadTime: 1200,
      p95ApiResponseTime: 350,
    },
    apiMetrics: {
      totalRequests: 1250,
      successRate: 95.5,
      errorRate: 4.5,
      averageResponseTime: 180,
      slowestEndpoints: [
        { endpoint: '/api/projects', averageTime: 320, requestCount: 150 },
        { endpoint: '/api/equipment', averageTime: 280, requestCount: 200 },
        { endpoint: '/api/dashboard/stats', averageTime: 250, requestCount: 100 },
        { endpoint: '/api/tasks', averageTime: 220, requestCount: 180 },
        { endpoint: '/api/users', averageTime: 190, requestCount: 120 },
      ],
    },
    userActivity: {
      activeUsers: 25,
      totalSessions: 45,
      averageSessionDuration: 1800000, // 30 dakika
      topPages: [
        { path: '/admin/dashboard', views: 120 },
        { path: '/admin/projects', views: 85 },
        { path: '/admin/inventory', views: 70 },
        { path: '/admin/tasks', views: 55 },
        { path: '/admin/users', views: 40 },
      ],
    },
    errors: {
      totalErrors: 56,
      errorRate: 4.5,
      topErrors: [
        { message: 'Network request failed', count: 20, lastOccurred: new Date().toISOString() },
        { message: 'Unauthorized access', count: 15, lastOccurred: new Date().toISOString() },
        { message: 'Resource not found', count: 12, lastOccurred: new Date().toISOString() },
        { message: 'Validation error', count: 9, lastOccurred: new Date().toISOString() },
      ],
    },
  };
}

/**
 * React Query hook - Performance metriklerini getirir
 * 
 * @param timeRange - Zaman aralığı
 * @param startDate - Başlangıç tarihi (opsiyonel)
 * @param endDate - Bitiş tarihi (opsiyonel)
 * @returns React Query hook sonucu
 */
export const usePerformanceMetrics = (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: [...QueryKeys.monitoring.performance(timeRange), startDate, endDate],
    queryFn: () => getPerformanceMetrics(timeRange, startDate, endDate),
    ...CacheStrategies.monitoring,
  });
};

/**
 * React Query hook - API response metriklerini getirir
 * 
 * @param timeRange - Zaman aralığı
 * @param endpoint - Belirli endpoint (opsiyonel)
 * @returns React Query hook sonucu
 */
export const useApiResponseMetrics = (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  endpoint?: string
) => {
  return useQuery({
    queryKey: [...QueryKeys.monitoring.apiMetrics(timeRange), endpoint],
    queryFn: () => getApiResponseMetrics(timeRange, endpoint),
    ...CacheStrategies.monitoring,
  });
};

/**
 * React Query hook - User activity metriklerini getirir
 * 
 * @param timeRange - Zaman aralığı
 * @param userId - Belirli kullanıcı (opsiyonel)
 * @returns React Query hook sonucu
 */
export const useUserActivityMetrics = (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  userId?: string
) => {
  return useQuery({
    queryKey: [...QueryKeys.monitoring.userActivity(timeRange), userId],
    queryFn: () => getUserActivityMetrics(timeRange, userId),
    ...CacheStrategies.monitoring,
  });
};

/**
 * React Query hook - Monitoring dashboard verilerini getirir
 * 
 * @param timeRange - Zaman aralığı
 * @returns React Query hook sonucu
 */
export const useMonitoringDashboard = (
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
) => {
  return useQuery({
    queryKey: QueryKeys.monitoring.dashboard(timeRange),
    queryFn: () => getMonitoringDashboard(timeRange),
    ...CacheStrategies.monitoring,
  });
};
