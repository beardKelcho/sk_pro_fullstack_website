import express from 'express';
import { dashboardController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = express.Router();

// Dashboard istatistiklerini getir (5 dakika cache)
router.get(
  '/stats',
  authenticate,
  cacheMiddleware({
    ttl: 300, // 5 dakika
    keyPrefix: 'dashboard',
    generateKey: (req: any) => `dashboard:stats:${req.user?.id || 'public'}`,
  }),
  dashboardController.getDashboardStats
);

// Dashboard grafik verilerini getir (5 dakika cache)
router.get(
  '/charts',
  authenticate,
  cacheMiddleware({
    ttl: 300, // 5 dakika
    keyPrefix: 'dashboard',
    generateKey: (req: any) => `dashboard:charts:${req.query.period || '30'}:${req.user?.id || 'public'}`,
  }),
  dashboardController.getDashboardCharts
);

export default router;

