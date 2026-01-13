import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  getResourceVersionHistory,
  getVersionById,
  rollbackVersion,
} from '../controllers/versionHistory.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Resource'un versiyon geçmişini getir
router.get(
  '/:resource/:resourceId',
  requirePermission(Permission.EQUIPMENT_VIEW), // Herhangi bir read permission yeterli
  getResourceVersionHistory
);

// Belirli bir versiyonu getir
router.get(
  '/version/:id',
  requirePermission(Permission.EQUIPMENT_VIEW),
  getVersionById
);

// Rollback yap
router.post(
  '/:resource/:resourceId/rollback/:version',
  requirePermission(Permission.EQUIPMENT_UPDATE), // Update permission gerekli
  rollbackVersion
);

export default router;

