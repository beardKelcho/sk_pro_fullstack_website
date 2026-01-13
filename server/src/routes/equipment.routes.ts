import express from 'express';
import { equipmentController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { validateEquipment, sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = express.Router();

// Tüm ekipmanları listele (2 dakika cache)
router.get(
  '/',
  authenticate,
  requirePermission(Permission.EQUIPMENT_VIEW),
  cacheMiddleware({
    ttl: 120, // 2 dakika
    keyPrefix: 'equipment',
    generateKey: (req) => `equipment:list:${JSON.stringify(req.query)}`,
  }),
  equipmentController.getAllEquipment
);

// Tek bir ekipmanın detaylarını getir (5 dakika cache)
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.EQUIPMENT_VIEW),
  cacheMiddleware({
    ttl: 300, // 5 dakika
    keyPrefix: 'equipment',
    generateKey: (req) => `equipment:${req.params.id}`,
  }),
  equipmentController.getEquipmentById
);

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