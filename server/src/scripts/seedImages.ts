import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import SiteImage from '../models/SiteImage';
import logger from '../utils/logger';

dotenv.config();

const seedImages = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB bağlantısı başarılı');

    // Client public images klasörünü kontrol et
    // process.cwd() server klasörüne işaret ediyor, bir üst dizine çıkıp client'a gitmemiz gerekiyor
    const rootPath = path.join(process.cwd(), '..');
    const clientPublicPath = path.join(rootPath, 'client', 'public', 'images');
    const imagesPath = clientPublicPath;

    logger.info(`Images klasörü aranıyor: ${imagesPath}`);

    if (!fs.existsSync(imagesPath)) {
      logger.error(`Images klasörü bulunamadı: ${imagesPath}`);
      logger.info(`Mevcut dizin: ${process.cwd()}`);
      logger.info(`Root path: ${rootPath}`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // slide*.jpg dosyalarını bul
    const imageFiles = fs.readdirSync(imagesPath)
      .filter(file => file.startsWith('slide') && file.endsWith('.jpg'))
      .sort((a, b) => {
        // slide1.jpg, slide2.jpg, ... sıralaması
        const numA = parseInt(a.replace('slide', '').replace('.jpg', ''));
        const numB = parseInt(b.replace('slide', '').replace('.jpg', ''));
        return numA - numB;
      });

    if (imageFiles.length === 0) {
      logger.warn('Hiç slide*.jpg dosyası bulunamadı');
      await mongoose.connection.close();
      process.exit(0);
    }

    logger.info(`${imageFiles.length} adet resim dosyası bulundu`);

    // Mevcut resimleri kontrol et
    const existingImages = await SiteImage.find({ category: 'project' });
    const existingFilenames = new Set(existingImages.map(img => img.filename));

    let createdCount = 0;
    let skippedCount = 0;

    // Her resmi veritabanına ekle
    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      const filePath = path.join(imagesPath, filename);
      
      // Dosyanın varlığını kontrol et
      if (!fs.existsSync(filePath)) {
        logger.warn(`Dosya bulunamadı: ${filePath}`);
        continue;
      }

      // Eğer bu resim zaten veritabanında varsa atla
      if (existingFilenames.has(filename)) {
        logger.info(`Resim zaten mevcut: ${filename}`);
        skippedCount++;
        continue;
      }

      // Resim bilgilerini oluştur
      const imageData = {
        filename: filename,
        originalName: filename,
        path: `images/${filename}`, // Client public/images altında
        url: `/images/${filename}`, // Public URL
        category: 'project' as const,
        order: i,
        isActive: true,
      };

      await SiteImage.create(imageData);
      createdCount++;
      logger.info(`Resim eklendi: ${filename} (sıra: ${i})`);
    }

    logger.info(`\n✅ Seed tamamlandı!`);
    logger.info(`   Oluşturulan: ${createdCount}`);
    logger.info(`   Atlanan: ${skippedCount}`);
    logger.info(`   Toplam: ${imageFiles.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seed hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedImages();

