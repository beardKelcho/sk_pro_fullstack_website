import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import logger from '../utils/logger';
import { normalizePath, pathToUrl } from '../utils/pathNormalizer';
import { checkAndOptimizeImage } from '../utils/imageOptimizer';

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

      const fileType = req.body.type || 'general';
      const normalizedPath = normalizePath(`${fileType}/${req.file.filename}`, fileType);
      const fileUrl = pathToUrl(normalizedPath);

      // Resim dosyası ise optimize et (async, background'da)
      if (req.file) {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.file.filename);
        if (isImage) {
          const fullPath = path.join(process.cwd(), 'uploads', normalizedPath);
          checkAndOptimizeImage(fullPath).catch((error) => {
            logger.error(`Resim optimizasyonu hatası (background): ${req.file?.filename}`, error);
          });
        }

        logger.info(`Dosya yüklendi: ${req.file.filename} (${(req.file.size / 1024 / 1024).toFixed(2)}MB) by user ${req.user?.id}`);
      }

      res.status(200).json({
        success: true,
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
          path: normalizedPath, // Normalize edilmiş path
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

      const fileType = req.body.type || 'general';
      const files = (req.files as Express.Multer.File[]).map((file) => {
        const normalizedPath = normalizePath(`${fileType}/${file.filename}`, fileType);
        const fileUrl = pathToUrl(normalizedPath);

        // Resim dosyası ise optimize et (async, background'da)
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
        if (isImage) {
          const fullPath = path.join(process.cwd(), 'uploads', normalizedPath);
          checkAndOptimizeImage(fullPath).catch((error) => {
            logger.error(`Resim optimizasyonu hatası (background): ${file.filename}`, error);
          });
        }

        return {
          filename: file.filename,
        originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: fileUrl,
          path: normalizedPath, // Normalize edilmiş path
        };
      });

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

