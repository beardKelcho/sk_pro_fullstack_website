import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  getAuditLogsController,
  getResourceAuditHistory,
} from '../controllers/auditLog.controller';

const router = express.Router();

// Tüm aktivite loglarını getir
router.get(
  '/',
  authenticate,
  requirePermission(Permission.VIEW_AUDIT_LOGS),
  getAuditLogsController
);

// Belirli bir kaynağın aktivite geçmişini getir
router.get(
  '/:resource/:resourceId',
  authenticate,
  requirePermission(Permission.VIEW_AUDIT_LOGS),
  getResourceAuditHistory
);

export default router;

