/**
 * Cloudinary Service
 * Cloudinary API entegrasyonu için service
 */

import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import path from 'path';
import logger from '../utils/logger';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  public_id?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  transformation?: any[];
  format?: string;
  quality?: string | number;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
  created_at: string;
}

/**
 * Buffer'dan Cloudinary'ye upload
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    // Resource type'ı dosya uzantısından belirle
    const resourceType = options.resource_type || getResourceType(filename);

    // Folder'ı type'dan oluştur
    const folder = options.folder || getFolderFromType(filename);

    logger.info(`📤 Cloudinary upload starting:`, {
      filename,
      folder,
      resourceType,
      bufferSize: `${(buffer.length / 1024 / 1024).toFixed(2)}MB`
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          overwrite: true,
          invalidate: true,
          ...options,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            logger.error('❌ Cloudinary upload error:', {
              filename,
              folder,
              resourceType,
              error: error.message,
              stack: error.stack
            });
            reject(error);
          } else if (result) {
            logger.info(`✅ Cloudinary upload success:`, {
              filename,
              public_id: result.public_id,
              secure_url: result.secure_url,
              resource_type: result.resource_type,
              format: result.format,
              size: `${(result.bytes / 1024 / 1024).toFixed(2)}MB`
            });
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url || result.url || '',
              url: result.url || '',
              format: result.format || '',
              width: result.width,
              height: result.height,
              bytes: result.bytes || 0,
              resource_type: result.resource_type || resourceType,
              created_at: result.created_at || new Date().toISOString(),
            });
          } else {
            const errorMsg = 'Cloudinary upload returned no result';
            logger.error(`❌ ${errorMsg}`, { filename, folder });
            reject(new Error(errorMsg));
          }
        }
      );

      // Buffer'ı stream'e çevir ve upload et
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  } catch (error) {
    logger.error('❌ Cloudinary upload exception:', {
      filename,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Cloudinary'den dosya sil
 */
export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> => {
  try {
    logger.info(`🗑️  Cloudinary delete starting:`, { publicId, resourceType });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    logger.info(`✅ Cloudinary delete complete:`, {
      publicId,
      resourceType,
      result: result.result // 'ok' or 'not found'
    });
  } catch (error) {
    logger.error('❌ Cloudinary delete error:', {
      publicId,
      resourceType,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Dosya uzantısından resource type belirle
 */
const getResourceType = (filename: string): 'image' | 'video' | 'raw' => {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    return 'image';
  }
  if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
    return 'video';
  }
  return 'raw';
};

/**
 * Dosya type'ından folder belirle
 */
const getFolderFromType = (_filename: string): string => {
  // Bu fonksiyon request'ten gelen type'a göre folder belirleyecek
  // Şimdilik genel bir folder yapısı kullanıyoruz
  return 'skproduction';
};
