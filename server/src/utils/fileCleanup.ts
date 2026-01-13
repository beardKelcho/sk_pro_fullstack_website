/**
 * Dosya Temizleme Utility
 * Kullanılmayan dosyaları temizler, orphaned files'ları bulur
 */

import fs from 'fs';
import path from 'path';
import SiteImage from '../models/SiteImage';
import logger from './logger';

/**
 * Orphaned files'ları bulur (DB'de olmayan dosyalar)
 * Disk'te var ama veritabanında kaydı olmayan dosyaları tespit eder
 * @returns Orphaned dosya path'leri dizisi
 * @example
 * const orphanedFiles = await findOrphanedFiles();
 * console.log(`${orphanedFiles.length} orphaned file bulundu`);
 */
export const findOrphanedFiles = async (): Promise<string[]> => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const orphanedFiles: string[] = [];

  try {
    // Tüm dosyaları bul
    const getAllFiles = (dir: string, fileList: string[] = []): string[] => {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          getAllFiles(filePath, fileList);
        } else {
          fileList.push(filePath);
        }
      });

      return fileList;
    };

    const allFiles = getAllFiles(uploadDir);

    // DB'deki tüm dosya path'lerini al
    const dbImages = await SiteImage.find({});
    const dbPaths = new Set(
      dbImages.map((img) => {
        // Farklı path formatlarını normalize et
        let normalizedPath = img.path || '';
        if (normalizedPath.startsWith('/uploads/')) {
          normalizedPath = normalizedPath.substring(1);
        }
        if (!normalizedPath.startsWith('uploads/')) {
          normalizedPath = path.join('uploads', normalizedPath);
        }
        return path.resolve(process.cwd(), normalizedPath);
      })
    );

    // DB'de olmayan dosyaları bul
    allFiles.forEach((file) => {
      if (!dbPaths.has(file)) {
        orphanedFiles.push(file);
      }
    });

    logger.info(`Orphaned files bulundu: ${orphanedFiles.length}`);
    return orphanedFiles;
  } catch (error) {
    logger.error('Orphaned files bulma hatası:', error);
    return [];
  }
};

/**
 * Orphaned files'ları siler
 * @param dryRun - Dry run modu (true: sadece listele, false: sil)
 * @returns Silinen dosya sayısı ve hata sayısı
 * @example
 * const result = await cleanupOrphanedFiles(false); // Gerçekten sil
 * console.log(`${result.deleted} dosya silindi`);
 */
export const cleanupOrphanedFiles = async (dryRun: boolean = true): Promise<{ deleted: number; errors: number }> => {
  const orphanedFiles = await findOrphanedFiles();
  let deleted = 0;
  let errors = 0;

  for (const filePath of orphanedFiles) {
    try {
      if (!dryRun) {
        fs.unlinkSync(filePath);
        deleted++;
        logger.info(`Dosya silindi: ${filePath}`);
      } else {
        logger.info(`[DRY RUN] Silinecek dosya: ${filePath}`);
      }
    } catch (error) {
      errors++;
      logger.error(`Dosya silme hatası: ${filePath}`, error);
    }
  }

  return { deleted, errors };
};

/**
 * Kullanılmayan dosyaları temizler (eski dosyalar, inactive images)
 * Belirtilen günden eski ve inactive olan dosyaları siler
 * @param daysOld - Kaç günden eski dosyalar silinecek? (default: 90)
 * @returns Silinen dosya sayısı ve hata sayısı
 * @example
 * const result = await cleanupInactiveFiles(30); // Son 30 günden eski inactive dosyaları sil
 */
export const cleanupInactiveFiles = async (daysOld: number = 90): Promise<{ deleted: number; errors: number }> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    // Inactive ve eski dosyaları bul
    const inactiveImages = await SiteImage.find({
      isActive: false,
      updatedAt: { $lt: cutoffDate },
    });

    let deleted = 0;
    let errors = 0;

    for (const image of inactiveImages) {
      try {
        // Dosya yolunu oluştur
        const filePath = path.join(process.cwd(), 'uploads', image.path || image.filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deleted++;
          logger.info(`Inactive dosya silindi: ${filePath}`);
        }

        // DB'den de sil
        await SiteImage.findByIdAndDelete(image._id);
      } catch (error) {
        errors++;
        logger.error(`Inactive dosya silme hatası: ${image._id}`, error);
      }
    }

    return { deleted, errors };
  } catch (error) {
    logger.error('Inactive files cleanup hatası:', error);
    return { deleted: 0, errors: 1 };
  }
};

/**
 * Dosya boyutunu kontrol eder ve büyük dosyaları raporlar
 * @param maxSizeMB - Maksimum dosya boyutu (MB, default: 50)
 * @returns Büyük dosyalar listesi (path ve size)
 * @example
 * const { largeFiles } = await checkFileSizes(100);
 * console.log(`${largeFiles.length} büyük dosya bulundu`);
 */
export const checkFileSizes = async (maxSizeMB: number = 50): Promise<{ largeFiles: Array<{ path: string; size: number }> }> => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const largeFiles: Array<{ path: string; size: number }> = [];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  try {
    const getAllFiles = (dir: string): Array<{ path: string; size: number }> => {
      const files: Array<{ path: string; size: number }> = [];
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          files.push(...getAllFiles(itemPath));
        } else {
          if (stat.size > maxSizeBytes) {
            files.push({
              path: itemPath,
              size: stat.size,
            });
          }
        }
      });

      return files;
    };

    const allLargeFiles = getAllFiles(uploadDir);

    logger.info(`Büyük dosyalar bulundu: ${allLargeFiles.length} (>${maxSizeMB}MB)`);
    return { largeFiles: allLargeFiles };
  } catch (error) {
    logger.error('Dosya boyutu kontrolü hatası:', error);
    return { largeFiles: [] };
  }
};

