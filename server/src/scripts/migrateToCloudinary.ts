/**
 * Migration Script: Local Storage -> Cloudinary
 * Mevcut local storage'daki dosyaları Cloudinary'ye taşır
 * 
 * Kullanım:
 *   STORAGE_TYPE=cloudinary ts-node src/scripts/migrateToCloudinary.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary } from '../services/cloudinaryService';
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
    
    // Cloudinary'ye upload et
    const result = await uploadToCloudinary(buffer, filename, {
      folder: type,
      resource_type: 'auto',
    });
    
    logger.info(`✅ Uploaded: ${relativePath} -> ${result.secure_url}`);
    
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
          url: result.secure_url,
          path: result.public_id,
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
const migrateToCloudinary = async () => {
  try {
    // Environment kontrolü
    if (process.env.STORAGE_TYPE !== 'cloudinary') {
      logger.error('❌ STORAGE_TYPE must be set to "cloudinary"');
      logger.info('💡 Set STORAGE_TYPE=cloudinary in your .env file');
      process.exit(1);
    }
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      logger.error('❌ Cloudinary credentials not found');
      logger.info('💡 Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
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
    logger.info('⚠️  This will upload all files to Cloudinary and update database records');
    
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
  migrateToCloudinary()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

export default migrateToCloudinary;
