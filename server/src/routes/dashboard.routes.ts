import express from 'express';
import { dashboardController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard istatistiklerini getir
router.get('/stats', authenticate, dashboardController.getDashboardStats);

export default router;

