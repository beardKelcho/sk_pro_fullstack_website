/**
 * Migration Script: Local Storage -> AWS S3
 * Mevcut local storage'daki dosyaları AWS S3'e taşır
 * 
 * Kullanım:
 *   STORAGE_TYPE=s3 ts-node src/scripts/migrateToS3.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { uploadToS3 } from '../services/s3Service';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import SiteImage from '../models/SiteImage';

dotenv.config();

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ file: string; error: string }>;
}

/**
 * MIME type belirleme
 */
const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
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

/**
 * Dosya yükleme ve veritabanı güncelleme
 */
const migrateFile = async (
  filePath: string,
  relativePath: string,
  stats: MigrationStats
): Promise<void> => {
  try {
    // Dosyayı oku
    const buffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    
    // Path'den type'ı çıkar (örn: "site-images/image.jpg" -> "site-images")
    const type = relativePath.split('/')[0] || 'general';
    const mimeType = getMimeType(filePath);
    
    // S3'e upload et
    const result = await uploadToS3(buffer, filename, {
      folder: type,
      contentType: mimeType,
      acl: 'public-read',
      cacheControl: 'max-age=31536000',
    });
    
    logger.info(`✅ Uploaded: ${relativePath} -> ${result.url}`);
    
    // Veritabanındaki ilgili kayıtları güncelle
    const updateResult = await SiteImage.updateMany(
      {
        $or: [
          { path: relativePath },
          { path: `/${relativePath}` },
          { path: `uploads/${relativePath}` },
          { path: `/uploads/${relativePath}` },
          { filename: filename },
        ],
      },
      {
        $set: {
          url: result.url,
          path: result.key,
          updatedAt: new Date(),
        },
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      logger.info(`📝 Updated ${updateResult.modifiedCount} database record(s) for ${relativePath}`);
    }
    
    stats.success++;
  } catch (error: any) {
    logger.error(`❌ Failed to migrate ${relativePath}:`, error);
    stats.errors.push({
      file: relativePath,
      error: error.message || String(error),
    });
    stats.failed++;
  }
};

/**
 * Klasörü recursive olarak tara ve dosyaları migrate et
 */
const migrateDirectory = async (
  dir: string,
  basePath: string = '',
  stats: MigrationStats
): Promise<void> => {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;
    
    if (item.isDirectory()) {
      // Recursive olarak alt klasörleri tara
      await migrateDirectory(fullPath, relativePath, stats);
    } else if (item.isFile()) {
      // Dosya ise migrate et
      stats.total++;
      await migrateFile(fullPath, relativePath, stats);
      
      // Rate limiting için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

/**
 * Ana migration fonksiyonu
 */
const migrateToS3 = async () => {
  try {
    // Environment kontrolü
    if (process.env.STORAGE_TYPE !== 's3') {
      logger.error('❌ STORAGE_TYPE must be set to "s3"');
      logger.info('💡 Set STORAGE_TYPE=s3 in your .env file');
      process.exit(1);
    }
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      logger.error('❌ AWS credentials not found');
      logger.info('💡 Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file');
      process.exit(1);
    }
    
    // MongoDB bağlantısı
    await connectDB();
    logger.info('✅ Connected to MongoDB');
    
    // Uploads klasörünü kontrol et
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      logger.error(`❌ Uploads directory not found: ${uploadsDir}`);
      process.exit(1);
    }
    
    logger.info(`📁 Starting migration from: ${uploadsDir}`);
    logger.info('⚠️  This will upload all files to S3 and update database records');
    
    // Kullanıcı onayı (opsiyonel - production'da kaldırılabilir)
    if (process.env.NODE_ENV !== 'production') {
      logger.info('⏳ Starting migration in 3 seconds... (Ctrl+C to cancel)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const stats: MigrationStats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };
    
    // Migration başlat
    const startTime = Date.now();
    await migrateDirectory(uploadsDir, '', stats);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Sonuçları göster
    logger.info('\n📊 Migration Summary:');
    logger.info(`   Total files: ${stats.total}`);
    logger.info(`   ✅ Success: ${stats.success}`);
    logger.info(`   ❌ Failed: ${stats.failed}`);
    logger.info(`   ⏭️  Skipped: ${stats.skipped}`);
    logger.info(`   ⏱️  Duration: ${duration}s`);
    
    if (stats.errors.length > 0) {
      logger.warn('\n❌ Errors:');
      stats.errors.slice(0, 10).forEach(({ file, error }) => {
        logger.warn(`   ${file}: ${error}`);
      });
      if (stats.errors.length > 10) {
        logger.warn(`   ... and ${stats.errors.length - 10} more errors`);
      }
    }
    
    // Veritabanı bağlantısını kapat
    await mongoose.connection.close();
    logger.info('✅ Migration completed');
    
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
if (require.main === module) {
  migrateToS3()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

export default migrateToS3;
