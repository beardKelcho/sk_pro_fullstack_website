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

// Dosya listesi (tüm dosyaları getir)
router.get(
  '/list',
  authenticate,
  requirePermission(Permission.FILE_VIEW),
  async (req: express.Request, res: express.Response) => {
    try {
      const { type, page = '1', limit = '50', search = '' } = req.query;
      const fileType = (type as string) || 'all';
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const searchTerm = (search as string).toLowerCase();

      if (isCloudStorage()) {
        // Cloud storage için şimdilik boş array döndür (gelecekte cloud storage API'den listeleme eklenebilir)
        return res.status(200).json({
          success: true,
          files: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
        });
      }

      // Local storage için dosya listesi
      const files: any[] = [];
      const typeDir = fileType === 'all' ? uploadDir : path.join(uploadDir, fileType as string);

      if (fs.existsSync(typeDir)) {
        const scanDirectory = (dir: string, basePath: string = '') => {
          const items = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const item of items) {
            const fullPath = path.join(dir, item.name);
            const relativePath = basePath ? `${basePath}/${item.name}` : item.name;
            
            if (item.isDirectory()) {
              scanDirectory(fullPath, relativePath);
            } else {
              const stats = fs.statSync(fullPath);
              const ext = path.extname(item.name).toLowerCase();
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(ext);
              const isVideo = /\.(mp4|webm|mov|avi)$/i.test(ext);
              
              // Search filtresi
              if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) {
                continue;
              }
              
              files.push({
                filename: item.name,
                path: relativePath,
                size: stats.size,
                uploadedAt: stats.birthtime,
                modifiedAt: stats.mtime,
                type: isImage ? 'image' : isVideo ? 'video' : 'document',
                url: pathToUrl(relativePath),
                mimetype: getMimeType(ext),
              });
            }
          }
        };
        
        scanDirectory(typeDir, fileType === 'all' ? '' : fileType as string);
      }

      // Sıralama: en yeni önce
      files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      // Sayfalama
      const total = files.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedFiles = files.slice(startIndex, startIndex + limitNum);

      res.status(200).json({
        success: true,
        files: paginatedFiles,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });
    } catch (error) {
      logger.error('Dosya listesi hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Dosya listesi alınırken bir hata oluştu',
      });
    }
  }
);

// MIME type helper
const getMimeType = (ext: string): string => {
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

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
          // Resource type'ı dosya uzantısına göre belirle
          const ext = filename.split('.').pop()?.toLowerCase();
          const resourceType = ext && ['mp4', 'webm', 'mov', 'avi'].includes(ext) ? 'video' : 'image';
          await deleteFromCloudinary(publicId, resourceType);
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
