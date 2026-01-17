import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * DB olmadan anlamlı çalışamayacak endpoint'lerde, Mongoose buffer timeout'larına düşmemek için
 * bağlantı yoksa hızlıca 503 döner.
 *
 * Allowlist:
 * - /api (root)
 * - /api/health
 * - /api/livez
 * - /api/readyz
 * - /api/monitoring (monitoring dashboard DB olmadan da kısmen çalışabilsin)
 * - /api/realtime (SSE stream: DB down olsa bile hızlı 503 yerine auth ile fail etsin)
 */
export const requireDbConnection = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path || '';
  if (
    path === '/' ||
    path === '/health' ||
    path === '/livez' ||
    path === '/readyz' ||
    path.startsWith('/monitoring') ||
    path.startsWith('/realtime')
  )
    return next();

  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
      details:
        process.env.NODE_ENV === 'development'
          ? 'MongoDB bağlantısı yok. Atlas IP whitelist veya MONGO_URI ayarlarını kontrol edin.'
          : undefined,
    });
  }

  return next();
};

