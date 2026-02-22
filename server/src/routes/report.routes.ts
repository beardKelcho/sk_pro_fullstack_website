import express from 'express';
import { exportInventoryReport, exportProjectsReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Sadece oturumu açık kullanıcılar indirebilsin
// Daha spesifik olmasını isterseniz requireRole(['Admin', 'Proje Yöneticisi']) eklenebilir.
router.get('/inventory/export', authenticate, exportInventoryReport);
router.get('/projects/export', authenticate, exportProjectsReport);

export default router;
