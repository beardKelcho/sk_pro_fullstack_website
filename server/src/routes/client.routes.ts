import express from 'express';
import { clientController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { validateClient, sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm müşterileri listele
router.get('/', authenticate, requirePermission(Permission.CLIENT_VIEW), clientController.getAllClients);

// Tek bir müşterinin detaylarını getir
router.get('/:id', authenticate, requirePermission(Permission.CLIENT_VIEW), clientController.getClientById);

// Yeni müşteri oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.CLIENT_CREATE),
  sanitizeInput,
  validateClient,
  clientController.createClient
);

// Müşteri güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.CLIENT_UPDATE),
  sanitizeInput,
  validateClient,
  clientController.updateClient
);

// Müşteri sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.CLIENT_DELETE),
  clientController.deleteClient
);

export default router;

