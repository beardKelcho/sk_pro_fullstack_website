import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { createStorage } from '../config/storage';
import uploadController from '../controllers/upload.controller';

const router = express.Router();

// Upload klasörünü oluştur (local storage için)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine oluştur (local/cloudinary/s3)
const storage = createStorage();

// File filter
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // İzin verilen dosya tipleri
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar|mp4|webm|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya tipi. Sadece resim, video, PDF, Office dosyaları ve arşiv dosyaları yüklenebilir.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (video dosyaları için daha büyük)
  },
  fileFilter,
});

// Dosya listesi (tüm dosyaları getir)
router.get(
  '/list',
  authenticate,
  requirePermission(Permission.FILE_VIEW),
  uploadController.list
);

// Tek dosya yükleme
router.post(
  '/single',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  upload.single('file'),
  uploadController.uploadSingle
);

// Çoklu dosya yükleme
router.post(
  '/multiple',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  upload.array('files', 10),
  uploadController.uploadMultiple
);

// Dosya silme
router.delete(
  '/:filename',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  uploadController.deleteFile
);

export default router;
