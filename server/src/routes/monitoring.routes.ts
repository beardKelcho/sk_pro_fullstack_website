import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { getMonitoringDashboard } from '../controllers/monitoring.controller';

const router = express.Router();

// Monitoring dashboard (admin)
router.get('/dashboard', authenticate, requirePermission(Permission.PROJECT_VIEW), getMonitoringDashboard);

export default router;

