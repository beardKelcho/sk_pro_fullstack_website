import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import logger from '../utils/logger';

const router = express.Router();

// Upload klasörünü oluştur
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // type parametresini hem body'den hem de query'den al
    const type = req.body.type || (req.query.type as string) || 'general';
    const typeDir = path.join(uploadDir, type);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // İzin verilen dosya tipleri
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya tipi. Sadece resim, PDF, Office dosyaları ve arşiv dosyaları yüklenebilir.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

// Tek dosya yükleme
router.post(
  '/single',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  upload.single('file'),
  (req: express.Request, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi',
        });
      }

      const fileUrl = `/uploads/${req.body.type || 'general'}/${req.file.filename}`;

      logger.info(`Dosya yüklendi: ${req.file.filename} by user ${req.user?.id}`);

      res.status(200).json({
        success: true,
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      });
    } catch (error) {
      logger.error('Dosya yükleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Dosya yüklenirken bir hata oluştu',
      });
    }
  }
);

// Çoklu dosya yükleme
router.post(
  '/multiple',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  upload.array('files', 10),
  (req: express.Request, res: express.Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi',
        });
      }

      const files = (req.files as Express.Multer.File[]).map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${req.body.type || 'general'}/${file.filename}`,
      }));

      logger.info(`${files.length} dosya yüklendi by user ${req.user?.id}`);

      res.status(200).json({
        success: true,
        files,
      });
    } catch (error) {
      logger.error('Dosya yükleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Dosya yüklenirken bir hata oluştu',
      });
    }
  }
);

// Dosya silme
router.delete(
  '/:filename',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  (req: express.Request, res: express.Response) => {
    try {
      const { filename } = req.params;
      const type = req.query.type as string || 'general';
      const filePath = path.join(uploadDir, type, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Dosya bulunamadı',
        });
      }

      fs.unlinkSync(filePath);
      logger.info(`Dosya silindi: ${filename} by user ${req.user?.id}`);

      res.status(200).json({
        success: true,
        message: 'Dosya başarıyla silindi',
      });
    } catch (error) {
      logger.error('Dosya silme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Dosya silinirken bir hata oluştu',
      });
    }
  }
);

export default router;

