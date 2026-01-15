import express from 'express';
import { userController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { validateUser, validateCreateUser, sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm kullanıcıları listele
router.get(
  '/',
  authenticate,
  requirePermission(Permission.USER_VIEW),
  userController.getAllUsers
);

// Tek bir kullanıcının detaylarını getir
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.USER_VIEW),
  userController.getUserById
);

// Yeni kullanıcı oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.USER_CREATE),
  sanitizeInput,
  validateCreateUser,
  userController.createUser
);

// Kullanıcı güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.USER_UPDATE),
  sanitizeInput,
  validateUser,
  userController.updateUser
);

// Kullanıcı sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.USER_DELETE),
  userController.deleteUser
);

export default router;

