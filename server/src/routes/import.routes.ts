import express from 'express';
import multer from 'multer';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { importEquipment, importProjects, downloadTemplate } from '../controllers/import.controller';

const router = express.Router();

// Multer konfigürasyonu (sadece Excel ve CSV dosyaları için)
const upload = multer({
  storage: multer.memoryStorage(), // Memory storage kullan (parse için)
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls|csv/;
    const extname = allowedTypes.test(file.originalname.split('.').pop()?.toLowerCase() || '');
    const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.mimetype === 'application/vnd.ms-excel' ||
                    file.mimetype === 'text/csv' ||
                    file.mimetype === 'application/csv';

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Sadece Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenir'));
    }
  },
});

// Template indirme
router.get(
  '/template/:type',
  authenticate,
  requirePermission(Permission.EQUIPMENT_VIEW), // Herhangi bir read permission yeterli
  downloadTemplate
);

// Ekipman import
router.post(
  '/equipment',
  authenticate,
  requirePermission(Permission.EQUIPMENT_CREATE),
  upload.single('file'),
  importEquipment
);

// Proje import
router.post(
  '/projects',
  authenticate,
  requirePermission(Permission.PROJECT_CREATE),
  upload.single('file'),
  importProjects
);

export default router;

