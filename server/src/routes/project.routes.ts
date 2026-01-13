import express from 'express';
import { projectController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { validateProject, sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm projeleri listele
router.get('/', authenticate, requirePermission(Permission.PROJECT_VIEW), projectController.getAllProjects);

// Tek bir projenin detaylarını getir
router.get('/:id', authenticate, requirePermission(Permission.PROJECT_VIEW), projectController.getProjectById);

// Yeni proje oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.PROJECT_CREATE),
  sanitizeInput,
  validateProject,
  projectController.createProject
);

// Proje güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.PROJECT_UPDATE),
  sanitizeInput,
  validateProject,
  projectController.updateProject
);

// Proje sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.PROJECT_DELETE),
  projectController.deleteProject
);

export default router;

