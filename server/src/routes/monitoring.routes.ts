import express from 'express';
import { Role } from "../config/permissions";
import { authenticate, requirePermission, authorize } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { getMonitoringDashboard } from '../controllers/monitoring.controller';

const router = express.Router();

// Protect all monitoring routes
router.use(authorize(Role.ADMIN)); // Only admins can access monitoring

// Monitoring dashboard (admin)
// Monitoring dashboard (admin only)
router.get('/dashboard', authenticate, authorize(Role.ADMIN), getMonitoringDashboard);

export default router;


