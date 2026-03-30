/**
 * Storage Configuration
 * Cloud Storage (Cloudinary/AWS S3) ve Local Storage desteği
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';
import { normalizeUploadType } from './uploadTypes';

export type StorageType = 'local' | 'cloudinary' | 's3';

/**
 * Storage type'ı environment variable'dan al
 * Default: 'local' (development için)
 */
export const getStorageType = (): StorageType => {
  const storageType = (process.env.STORAGE_TYPE || 'local').toLowerCase() as StorageType;
  return ['local', 'cloudinary', 's3'].includes(storageType) ? storageType : 'local';
};

/**
 * Local storage için multer diskStorage
 */
export const createLocalStorage = (uploadDir: string): multer.StorageEngine => {
  // Upload klasörünü oluştur
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Path traversal koruması: sadece izin verilen klasörler kabul edilir
      const rawType = (
        req.body.type ||
        req.query.type ||
        req.body.category ||
        req.query.category ||
        'general'
      ) as string;
      const type = normalizeUploadType(rawType);
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
};

/**
 * Cloudinary storage için multer memoryStorage
 * Cloudinary SDK ile upload yapılacak
 */
export const createCloudinaryStorage = (): multer.StorageEngine => {
  // Cloudinary memory storage - dosya buffer olarak alınır, sonra Cloudinary'ye yüklenir
  return multer.memoryStorage();
};

/**
 * AWS S3 storage için multer memoryStorage
 * AWS SDK ile upload yapılacak
 */
export const createS3Storage = (): multer.StorageEngine => {
  // S3 memory storage - dosya buffer olarak alınır, sonra S3'e yüklenir
  return multer.memoryStorage();
};

/**
 * Storage engine oluştur
 */
export const createStorage = (): multer.StorageEngine => {
  const storageType = getStorageType();
  const uploadDir = path.join(process.cwd(), 'uploads');

  switch (storageType) {
    case 'cloudinary':
      logger.info('📦 Using Cloudinary storage');
      return createCloudinaryStorage();
    case 's3':
      logger.info('📦 Using AWS S3 storage');
      return createS3Storage();
    case 'local':
    default:
      logger.info('📦 Using local storage');
      return createLocalStorage(uploadDir);
  }
};

/**
 * Storage type kontrolü
 */
export const isCloudStorage = (): boolean => {
  const storageType = getStorageType();
  return storageType === 'cloudinary' || storageType === 's3';
};
