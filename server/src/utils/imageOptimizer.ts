/**
 * Image Optimization Utility
 * Resimleri optimize eder, boyutlandırır, sıkıştırır
 */

import fs from 'fs';
import path from 'path';
import logger from './logger';

/**
 * Image optimization options
 */
export interface ImageOptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Resim optimizasyonu yapar
 * Sharp kütüphanesi ile resmi boyutlandırır, sıkıştırır ve format dönüştürür
 * Not: Sharp kütüphanesi gerekli (opsiyonel, production'da kullanılabilir)
 * 
 * @param filePath - Optimize edilecek dosya yolu
 * @param options - Optimizasyon seçenekleri
 * @param options.maxWidth - Maksimum genişlik (px, default: 1920)
 * @param options.maxHeight - Maksimum yükseklik (px, default: 1080)
 * @param options.quality - Kalite (1-100, default: 85)
 * @param options.format - Çıktı formatı (jpeg, png, webp, default: jpeg)
 * @returns Optimize edilmiş dosya yolu (orijinal dosya üzerine yazılır)
 * @example
 * await optimizeImage('/uploads/image.jpg', { maxWidth: 1920, quality: 85 });
 */
export const optimizeImage = async (
  filePath: string,
  options: ImageOptimizeOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'jpeg',
  } = options;

  try {
    // Sharp kontrolü (opsiyonel)
    let sharp: any;
    try {
      sharp = require('sharp');
    } catch (error) {
      logger.warn('Sharp kütüphanesi yüklü değil, resim optimizasyonu atlanıyor');
      return filePath; // Sharp yoksa orijinal dosyayı döndür
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Dosya bulunamadı: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);

    if (!isImage) {
      return filePath; // Resim değilse optimize etme
    }

    // Dosya boyutunu kontrol et
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Küçük dosyalar için optimize etme (1MB altı)
    if (fileSizeMB < 1) {
      logger.debug(`Dosya zaten küçük (${fileSizeMB.toFixed(2)}MB), optimize edilmedi: ${filePath}`);
      return filePath;
    }

    // Optimize edilmiş dosya yolu
    const optimizedPath = filePath.replace(/(\.[^.]+)$/, `-optimized.${format}`);

    // Sharp ile optimize et
    await sharp(filePath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toFile(optimizedPath);

    // Orijinal dosyayı sil ve optimize edilmiş dosyayı orijinal isimle değiştir
    const originalSize = stats.size;
    const optimizedStats = fs.statSync(optimizedPath);
    const optimizedSize = optimizedStats.size;

    const savedMB = (originalSize - optimizedSize) / (1024 * 1024);
    const savedPercent = ((originalSize - optimizedSize) / originalSize) * 100;

    logger.info(
      `Resim optimize edildi: ${path.basename(filePath)} - ${savedMB.toFixed(2)}MB tasarruf (%${savedPercent.toFixed(1)})`
    );

    // Orijinal dosyayı sil ve optimize edilmiş dosyayı orijinal isimle değiştir
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath);

    return filePath;
  } catch (error) {
    logger.error(`Resim optimizasyonu hatası: ${filePath}`, error);
    return filePath; // Hata durumunda orijinal dosyayı döndür
  }
};

/**
 * Resim boyutunu kontrol eder ve gerekirse optimize eder
 * Dosya boyutu belirtilen MB'dan büyükse otomatik optimize eder
 * 
 * @param filePath - Kontrol edilecek dosya yolu
 * @param maxSizeMB - Maksimum dosya boyutu (MB, default: 5)
 * @returns Optimize edilmiş dosya yolu
 * @example
 * await checkAndOptimizeImage('/uploads/image.jpg', 5); // 5MB'dan büyükse optimize et
 */
export const checkAndOptimizeImage = async (
  filePath: string,
  maxSizeMB: number = 5
): Promise<string> => {
  try {
    if (!fs.existsSync(filePath)) {
      return filePath;
    }

    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      logger.info(`Büyük resim bulundu (${fileSizeMB.toFixed(2)}MB), optimize ediliyor: ${filePath}`);
      return await optimizeImage(filePath);
    }

    return filePath;
  } catch (error) {
    logger.error(`Resim kontrolü hatası: ${filePath}`, error);
    return filePath;
  }
};

/**
 * Batch image optimization
 * Birden fazla resmi toplu olarak optimize eder
 * @param filePaths - Optimize edilecek dosya yolları dizisi
 * @param options - Optimizasyon seçenekleri
 * @returns Optimizasyon sonuçları (optimized, skipped, errors)
 * @example
 * const result = await optimizeImages(['/uploads/img1.jpg', '/uploads/img2.jpg']);
 * console.log(`${result.optimized} resim optimize edildi`);
 */
export const optimizeImages = async (
  filePaths: string[],
  options: ImageOptimizeOptions = {}
): Promise<{ optimized: number; skipped: number; errors: number }> => {
  let optimized = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of filePaths) {
    try {
      const result = await optimizeImage(filePath, options);
      if (result !== filePath) {
        optimized++;
      } else {
        skipped++;
      }
    } catch (error) {
      errors++;
      logger.error(`Batch optimize hatası: ${filePath}`, error);
    }
  }

  return { optimized, skipped, errors };
};

