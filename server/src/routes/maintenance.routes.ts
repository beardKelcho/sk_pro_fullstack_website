import express from 'express';
import { maintenanceController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm bakımları listele
router.get('/', authenticate, requirePermission(Permission.MAINTENANCE_VIEW), maintenanceController.getAllMaintenances);

// Tek bir bakımın detaylarını getir
router.get('/:id', authenticate, requirePermission(Permission.MAINTENANCE_VIEW), maintenanceController.getMaintenanceById);

// Yeni bakım oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.MAINTENANCE_CREATE),
  sanitizeInput,
  maintenanceController.createMaintenance
);

// Bakım güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.MAINTENANCE_UPDATE),
  sanitizeInput,
  maintenanceController.updateMaintenance
);

// Bakım sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.MAINTENANCE_DELETE),
  maintenanceController.deleteMaintenance
);

export default router;

