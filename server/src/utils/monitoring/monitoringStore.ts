export type TimeRange = '1h' | '24h' | '7d' | '30d';

export type ApiRequestMetric = {
  ts: number; // epoch ms
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
};

export type DbQueryMetric = {
  ts: number; // epoch ms
  model: string;
  operation: string;
  durationMs: number;
};

const MAX_API_METRICS = 25_000;
const MAX_DB_METRICS = 25_000;

const apiMetrics: ApiRequestMetric[] = [];
const dbMetrics: DbQueryMetric[] = [];

export const timeRangeToMs = (range: TimeRange): number => {
  switch (range) {
    case '1h':
      return 60 * 60 * 1000;
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '7d':
      return 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
};

const trimToMax = <T>(arr: T[], max: number) => {
  if (arr.length <= max) return;
  arr.splice(0, arr.length - max);
};

export const normalizePath = (rawPath: string): string => {
  // ObjectId'leri :id olarak normalize et (dashboard/top endpoints için)
  return rawPath.replace(/\/[0-9a-fA-F]{24}(?=\/|$)/g, '/:id');
};

export const recordApiMetric = (metric: ApiRequestMetric) => {
  apiMetrics.push(metric);
  trimToMax(apiMetrics, MAX_API_METRICS);
};

export const recordDbMetric = (metric: DbQueryMetric) => {
  dbMetrics.push(metric);
  trimToMax(dbMetrics, MAX_DB_METRICS);
};

export const getApiMetricsInRange = (range: TimeRange): ApiRequestMetric[] => {
  const cutoff = Date.now() - timeRangeToMs(range);
  return apiMetrics.filter((m) => m.ts >= cutoff);
};

export const getDbMetricsInRange = (range: TimeRange): DbQueryMetric[] => {
  const cutoff = Date.now() - timeRangeToMs(range);
  return dbMetrics.filter((m) => m.ts >= cutoff);
};

export const p95 = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(0.95 * (sorted.length - 1));
  return sorted[idx] ?? 0;
};

export const avg = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

