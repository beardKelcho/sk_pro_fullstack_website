import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import logger from '../utils/logger';
import { normalizePath, pathToUrl } from '../utils/pathNormalizer';
import { checkAndOptimizeImage } from '../utils/imageOptimizer';
import { createStorage, isCloudStorage } from '../config/storage';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';
import { uploadToS3, deleteFromS3 } from '../services/s3Service';

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

// Tek dosya yükleme
router.post(
  '/single',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  upload.single('file'),
  async (req: express.Request, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi',
        });
      }

      const fileType = (req.body.type || req.query.type || 'general') as string;
      let fileUrl: string;
      let filePath: string;
      let filename: string;

      // Cloud storage kullanılıyorsa
      if (isCloudStorage() && req.file.buffer) {
        const storageType = process.env.STORAGE_TYPE?.toLowerCase();
        
        if (storageType === 'cloudinary') {
          // Cloudinary'ye upload
          const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, {
            folder: fileType,
            resource_type: 'auto',
          });
          
          fileUrl = result.secure_url;
          filePath = result.public_id;
          filename = result.public_id.split('/').pop() || req.file.originalname;
        } else if (storageType === 's3') {
          // S3'e upload
          const result = await uploadToS3(req.file.buffer, req.file.originalname, {
            folder: fileType,
            contentType: req.file.mimetype,
          });
          
          fileUrl = result.url;
          filePath = result.key;
          filename = result.key.split('/').pop() || req.file.originalname;
        } else {
          throw new Error('Unknown storage type');
        }
      } else {
        // Local storage
        const normalizedPath = normalizePath(`${fileType}/${req.file.filename}`, fileType);
        fileUrl = pathToUrl(normalizedPath);
        filePath = normalizedPath;
        filename = req.file.filename;

        // Resim dosyası ise optimize et (async, background'da)
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.file.filename);
        if (isImage) {
          const fullPath = path.join(process.cwd(), 'uploads', normalizedPath);
          checkAndOptimizeImage(fullPath).catch((error) => {
            logger.error(`Resim optimizasyonu hatası (background): ${req.file?.filename}`, error);
          });
        }
      }

      logger.info(`Dosya yüklendi: ${filename} (${(req.file.size / 1024 / 1024).toFixed(2)}MB) by user ${req.user?.id}`);

      res.status(200).json({
        success: true,
        file: {
          filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
          path: filePath,
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
  async (req: express.Request, res: express.Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi',
        });
      }

      const fileType = (req.body.type || req.query.type || 'general') as string;
      const files = await Promise.all(
        (req.files as Express.Multer.File[]).map(async (file) => {
          let fileUrl: string;
          let filePath: string;
          let filename: string;

          // Cloud storage kullanılıyorsa
          if (isCloudStorage() && file.buffer) {
            const storageType = process.env.STORAGE_TYPE?.toLowerCase();
            
            if (storageType === 'cloudinary') {
              const result = await uploadToCloudinary(file.buffer, file.originalname, {
                folder: fileType,
                resource_type: 'auto',
              });
              
              fileUrl = result.secure_url;
              filePath = result.public_id;
              filename = result.public_id.split('/').pop() || file.originalname;
            } else if (storageType === 's3') {
              const result = await uploadToS3(file.buffer, file.originalname, {
                folder: fileType,
                contentType: file.mimetype,
              });
              
              fileUrl = result.url;
              filePath = result.key;
              filename = result.key.split('/').pop() || file.originalname;
            } else {
              throw new Error('Unknown storage type');
            }
          } else {
            // Local storage
            const normalizedPath = normalizePath(`${fileType}/${file.filename}`, fileType);
            fileUrl = pathToUrl(normalizedPath);
            filePath = normalizedPath;
            filename = file.filename;

            // Resim dosyası ise optimize et (async, background'da)
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
            if (isImage) {
              const fullPath = path.join(process.cwd(), 'uploads', normalizedPath);
              checkAndOptimizeImage(fullPath).catch((error) => {
                logger.error(`Resim optimizasyonu hatası (background): ${file.filename}`, error);
              });
            }
          }

          return {
            filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: fileUrl,
            path: filePath,
          };
        })
      );

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
  async (req: express.Request, res: express.Response) => {
    try {
      const { filename } = req.params;
      const fileType = (req.query.type as string) || 'general';

      if (isCloudStorage()) {
        const storageType = process.env.STORAGE_TYPE?.toLowerCase();
        
        if (storageType === 'cloudinary') {
          // Cloudinary'den sil
          const publicId = `${fileType}/${filename}`;
          await deleteFromCloudinary(publicId, 'auto');
        } else if (storageType === 's3') {
          // S3'ten sil
          const key = `${fileType}/${filename}`;
          await deleteFromS3(key);
        }
      } else {
        // Local storage'dan sil
        const filePath = path.join(uploadDir, fileType, filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Dosya silindi: ${filename} by user ${req.user?.id}`);
        } else {
          return res.status(404).json({
            success: false,
            message: 'Dosya bulunamadı',
          });
        }
      }

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
