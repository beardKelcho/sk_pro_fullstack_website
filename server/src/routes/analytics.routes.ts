import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { getAnalyticsDashboard } from '../controllers/analytics.controller';

const router = express.Router();

router.use(authenticate);
router.use(requirePermission(Permission.ANALYTICS_VIEW));

router.get('/dashboard', getAnalyticsDashboard);

export default router;

