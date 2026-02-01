import express from 'express';
import { authenticate, requirePermission, authorize } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { getMonitoringDashboard } from '../controllers/monitoring.controller';

const router = express.Router();

// Monitoring dashboard (admin)
// Monitoring dashboard (admin only)
router.get('/dashboard', authenticate, authorize('admin', 'business_owner'), getMonitoringDashboard);

export default router;

