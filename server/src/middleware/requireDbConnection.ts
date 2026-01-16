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
 * - /api/monitoring (monitoring dashboard DB olmadan da kısmen çalışabilsin)
 */
export const requireDbConnection = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path || '';
  if (path === '/' || path === '/health' || path.startsWith('/monitoring')) return next();

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

