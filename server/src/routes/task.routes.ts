import express from 'express';
import { taskController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { sanitizeInput } from '../middleware/inputValidation';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm görevleri listele
router.get('/', authenticate, requirePermission(Permission.TASK_VIEW), taskController.getAllTasks);

// Tek bir görevin detaylarını getir
router.get('/:id', authenticate, requirePermission(Permission.TASK_VIEW), taskController.getTaskById);

// Yeni görev oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.TASK_CREATE),
  sanitizeInput,
  taskController.createTask
);

// Görev güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.TASK_UPDATE),
  sanitizeInput,
  taskController.updateTask
);

// Görev sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.TASK_DELETE),
  taskController.deleteTask
);

export default router;

