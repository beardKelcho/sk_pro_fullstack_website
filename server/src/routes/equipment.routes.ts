import express from 'express';
import { equipmentController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { validateEquipment, sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm ekipmanları listele
router.get('/', authenticate, requirePermission(Permission.EQUIPMENT_VIEW), equipmentController.getAllEquipment);

// Tek bir ekipmanın detaylarını getir
router.get('/:id', authenticate, requirePermission(Permission.EQUIPMENT_VIEW), equipmentController.getEquipmentById);

// Yeni ekipman oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.EQUIPMENT_CREATE),
  sanitizeInput,
  validateEquipment,
  equipmentController.createEquipment
);

// Ekipman güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.EQUIPMENT_UPDATE),
  sanitizeInput,
  validateEquipment,
  equipmentController.updateEquipment
);

// Ekipman sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.EQUIPMENT_DELETE),
  equipmentController.deleteEquipment
);

export default router; 