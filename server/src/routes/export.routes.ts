import express from 'express';
import { exportController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// Export route'ları
router.get('/equipment', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportEquipment);
router.get('/projects', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportProjects);
router.get('/tasks', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportTasks);
router.get('/clients', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportClients);
router.get('/maintenance', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportMaintenance);

export default router;

