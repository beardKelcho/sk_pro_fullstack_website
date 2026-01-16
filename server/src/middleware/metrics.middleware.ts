import type { NextFunction, Request, Response } from 'express';
import { normalizePath, recordApiMetric } from '../utils/monitoring/monitoringStore';

const shouldSkip = (req: Request): boolean => {
  const p = req.path || '';
  // Health ve swagger gibi uçları hariç tutalım
  if (p === '/' || p === '/health') return true;
  return false;
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (shouldSkip(req)) return next();

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const path = normalizePath(req.originalUrl.split('?')[0] || req.path || '');
    recordApiMetric({
      ts: Date.now(),
      method: (req.method || 'GET').toUpperCase(),
      path,
      statusCode: res.statusCode || 0,
      durationMs,
    });
  });

  return next();
};

