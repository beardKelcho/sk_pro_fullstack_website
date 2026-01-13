import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  getReportSchedules,
  getReportScheduleById,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
} from '../controllers/reportSchedule.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Tüm rapor zamanlamalarını getir
router.get(
  '/',
  requirePermission(Permission.EXPORT_DATA), // Export permission yeterli
  getReportSchedules
);

// Tek bir rapor zamanlamasını getir
router.get(
  '/:id',
  requirePermission(Permission.EXPORT_DATA),
  getReportScheduleById
);

// Yeni rapor zamanlaması oluştur
router.post(
  '/',
  requirePermission(Permission.EXPORT_DATA),
  createReportSchedule
);

// Rapor zamanlamasını güncelle
router.put(
  '/:id',
  requirePermission(Permission.EXPORT_DATA),
  updateReportSchedule
);

// Rapor zamanlamasını sil
router.delete(
  '/:id',
  requirePermission(Permission.EXPORT_DATA),
  deleteReportSchedule
);

export default router;

