import express from 'express';
import { exportController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// CSV Export route'ları
router.get('/equipment/csv', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportEquipment);
router.get('/projects/csv', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportProjects);
router.get('/tasks/csv', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportTasks);
router.get('/clients/csv', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportClients);
router.get('/maintenance/csv', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportMaintenance);

// Excel Export route'ları
router.get('/equipment/excel', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportEquipmentExcel);
router.get('/projects/excel', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportProjectsExcel);

// PDF Export route'ları
router.get('/equipment/pdf', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportEquipmentPDF);
router.get('/projects/pdf', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportProjectsPDF);
router.get('/dashboard/pdf', authenticate, requirePermission(Permission.EXPORT_DATA), exportController.exportDashboardPDF);

export default router;

