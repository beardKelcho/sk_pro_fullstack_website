import express from 'express';
import { exportInventoryReport, exportProjectsReport } from '../controllers/report.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// EXPORT_DATA izni olmayan roller (TEKNISYEN vb.) rapor indiremez
router.get('/inventory/export', authenticate, requirePermission(Permission.EXPORT_DATA), exportInventoryReport);
router.get('/projects/export', authenticate, requirePermission(Permission.EXPORT_DATA), exportProjectsReport);

export default router;
