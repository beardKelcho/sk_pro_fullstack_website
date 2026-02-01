import express from 'express';
import { authenticate, requirePermission, authorize } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { getMonitoringDashboard } from '../controllers/monitoring.controller';

const router = express.Router();

// Protect all monitoring routes
router.use(authorize('admin')); // Only admins can access monitoring

// Monitoring dashboard (admin)
// Monitoring dashboard (admin only)
router.get('/dashboard', authenticate, authorize('admin', 'business_owner'), getMonitoringDashboard);


