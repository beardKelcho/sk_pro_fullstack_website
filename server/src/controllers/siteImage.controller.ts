import { Request, Response } from 'express';
import SiteImage from '../models/SiteImage';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Helper: Resim URL'lerini düzelt (Cloudinary uyumluluğu için)
const fixImageUrls = (image: any): any => {
  if (!image) return image;

  const storageType = (process.env.STORAGE_TYPE || 'local').toLowerCase();

  // Cloudinary URL oluştur veya Mevcudu İyileştir
  const fixUrl = (filename: string, existingUrl: string | undefined, category: string): string => {
    // 1. Filename varsa, kesinlikle SIFIRDAN oluştur (User Request: Strict Construction)
    // Bu, admin panelindeki 404 hatalarını (bozuk URL'leri) çözer.
    if (filename && typeof filename === 'string') {
      const baseUrl = 'https://res.cloudinary.com/dmeviky6f';

      // Resource Type belirle
      let resourceType = 'image';
      const ext = filename.split('.').pop()?.toLowerCase();
      const hasExt = ext && (ext.length === 3 || ext.length === 4);

      if (category === 'video' || (hasExt && ['mp4', 'webm', 'mov', 'avi'].includes(ext!))) {
        resourceType = 'video';
      }

      let cleanFilename = filename;
      if (!hasExt) {
        if (resourceType === 'video') cleanFilename += '.mp4';
        else cleanFilename += '.jpg';
      }

      return `${baseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
    }

    // 2. Filename yoksa, mevcut URL'i iyileştir
    if (existingUrl && typeof existingUrl === 'string' && existingUrl.includes('cloudinary.com')) {
      if (existingUrl.startsWith('http:')) return existingUrl.replace('http:', 'https:');
      if (existingUrl.startsWith('https:')) return existingUrl;
      return `https://${existingUrl}`;
    }

    return existingUrl || '';
  };

  const fixedImage = JSON.parse(JSON.stringify(image));

  if (fixedImage.filename || fixedImage.url) {
    fixedImage.url = fixUrl(fixedImage.filename, fixedImage.url, fixedImage.category || 'gallery');
  }

  return fixedImage;
};

// Tüm resimleri listele
export const getAllImages = async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;

    const filters: any = {};
    if (category) {
      filters.category = category;
    }
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const images = await SiteImage.find(filters)
      .sort({ category: 1, order: 1, createdAt: -1 });

    // URL'leri düzelt
    const fixedImages = images.map(img => {
      const imgObj = img.toObject();
      return fixImageUrls(imgObj);
    });

    res.status(200).json({
      success: true,
      count: fixedImages.length,
      images: fixedImages,
    });
  } catch (error) {
    logger.error('Resim listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resimler listelenirken bir hata oluştu',
    });
  }
};

// Tek bir resmi getir (JSON olarak)
export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resim ID',
      });
    }

    const image = await SiteImage.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı',
      });
    }

    const imgObj = image.toObject();
    const fixedImage = fixImageUrls(imgObj);

    res.status(200).json({
      success: true,
      image: fixedImage,
    });
  } catch (error) {
    logger.error('Resim detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resim detayları alınırken bir hata oluştu',
    });
  }
};

// Resmi ID ile serve et (dosya olarak)
export const serveImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Geçersiz resim ID');
    }

    const image = await SiteImage.findById(id);

    if (!image) {
      logger.warn(`Resim bulunamadı: ${id}`);
      return res.status(404).send('Resim bulunamadı');
    }

    // Resim dosyasının yolunu oluştur
    // Path formatı: "site-images/filename.jpg" veya "general/filename.jpg" veya "/uploads/site-images/filename.jpg" veya direkt "filename.jpg"
    let filePath: string | undefined;

    // Önce image.path'i kontrol et
    if (image.path) {
      // Path varsa, farklı formatları kontrol et
      if (image.path.startsWith('/uploads/')) {
        // "/uploads/site-images/filename.jpg" formatı
        filePath = path.join(process.cwd(), image.path.substring(1)); // Başındaki /'yi kaldır
      } else if (image.path.startsWith('uploads/')) {
        // "uploads/site-images/filename.jpg" formatı
        filePath = path.join(process.cwd(), image.path);
      } else if (image.path.startsWith('/images/') || image.path.startsWith('images/')) {
        // Artık client/public/images kullanılmıyor, tüm dosyalar uploads klasöründe
        // Eski resimler için uploads/general veya uploads/site-images klasörlerini dene
        const imageFileName = image.path.replace(/^\/?images\//, '');
        filePath = path.join(process.cwd(), 'uploads', 'general', imageFileName);
      } else if (image.path.startsWith('/')) {
        // "/site-images/filename.jpg" formatı
        filePath = path.join(process.cwd(), 'uploads', image.path.substring(1));
      } else {
        // "site-images/filename.jpg" veya "general/filename.jpg" veya direkt "filename.jpg" formatı
        filePath = path.join(process.cwd(), 'uploads', image.path);
      }
    } else if (image.filename) {
      // Path yoksa, filename'den oluştur - önce category'ye göre, sonra alternatif yolları dene
      const category = image.category || 'general';
      const possiblePaths = [
        path.join(process.cwd(), 'uploads', 'general', image.filename), // ÖNCE general (video dosyaları genelde orada)
        path.join(process.cwd(), 'uploads', 'videos', image.filename), // Sonra videos
        path.join(process.cwd(), 'uploads', category, image.filename), // category klasörü (videos, site-images, general)
        path.join(process.cwd(), 'uploads', 'site-images', image.filename),
      ];

      // İlk bulunan path'i kullan
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          filePath = possiblePath;
          break;
        }
      }

      // Hiçbiri bulunamazsa, category klasörünü kullan
      if (!filePath) {
        filePath = path.join(process.cwd(), 'uploads', category, image.filename);
      }
    } else {
      logger.error(`Resim path ve filename eksik: ${id}`, image);
      return res.status(404).send('Resim/video dosya bilgisi bulunamadı');
    }

    // filePath kontrolü
    if (!filePath) {
      logger.error(`Resim dosya yolu oluşturulamadı: ${id}`, image);
      return res.status(404).send('Resim/video dosya yolu bulunamadı');
    }

    // Dosya var mı kontrol et - birden fazla yerde ara
    if (!fs.existsSync(filePath)) {
      // Alternatif yolları dene - path'ten klasör adını çıkar veya farklı klasörleri dene
      const pathParts = image.path ? image.path.split('/') : [];
      const categoryFromPath = pathParts.length > 0 ? pathParts[0] : null;

      const alternativePaths = [
        // Path'teki kategori ile (eğer path varsa)
        categoryFromPath && !image.path.startsWith('images/') ? path.join(process.cwd(), 'uploads', image.path) : null,
        // images/ ile başlayan path'ler için uploads/general (eski resimler)
        image.path && (image.path.startsWith('images/') || image.path.startsWith('/images/'))
          ? path.join(process.cwd(), 'uploads', 'general', image.filename)
          : null,
        // general klasörü (upload route'u bazen general'a kaydediyor - ÖNCE BUNU KONTROL ET)
        path.join(process.cwd(), 'uploads', 'general', image.filename),
        // videos klasörü (video dosyaları için)
        path.join(process.cwd(), 'uploads', 'videos', image.filename),
        // category klasörü (videos, site-images, general)
        image.category ? path.join(process.cwd(), 'uploads', image.category, image.filename) : null,
        // site-images klasörü
        path.join(process.cwd(), 'uploads', 'site-images', image.filename),
        // direkt uploads klasörü
        path.join(process.cwd(), 'uploads', image.filename),
      ].filter((p): p is string => p !== null);

      let found = false;
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          filePath = altPath;
          found = true;
          logger.info(`Resim alternatif yolda bulundu: ${altPath} (orijinal path: ${image.path})`);
          break;
        }
      }

      if (!found) {
        logger.warn(`Resim dosyası bulunamadı: ${filePath}`, {
          imageId: id,
          image: {
            path: image.path,
            filename: image.filename,
            url: image.url
          },
          triedPaths: [filePath, ...alternativePaths]
        });
        return res.status(404).send('Resim dosyası bulunamadı');
      }
    }

    // Content-Type'ı ayarla - hem resim hem video dosyaları için
    const ext = path.extname(image.filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      // Resim formatları
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      // Video formatları
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
    };
    const contentType = contentTypeMap[ext] || (image.category === 'video' ? 'video/mp4' : 'image/jpeg');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Dosyayı gönder
    res.sendFile(filePath);
  } catch (error) {
    logger.error('Resim serve hatası:', error);
    res.status(500).send('Resim gösterilirken bir hata oluştu');
  }
};

// Yeni resim oluştur
export const createImage = async (req: Request, res: Response) => {
  try {
    const { filename, originalName, path: filePath, url, category, order } = req.body;

    if (!filename || !originalName || !filePath || !url) {
      return res.status(400).json({
        success: false,
        message: 'Dosya bilgileri gereklidir',
      });
    }

    const image = await SiteImage.create({
      filename,
      originalName,
      path: filePath,
      url,
      category: category || 'gallery',
      order: order || 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      image,
    });
  } catch (error) {
    logger.error('Resim oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resim oluşturulurken bir hata oluştu',
    });
  }
};

// Resim güncelle
export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, order, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resim ID',
      });
    }

    const image = await SiteImage.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı',
      });
    }

    if (category) image.category = category;
    if (order !== undefined) image.order = order;
    if (isActive !== undefined) image.isActive = isActive;

    await image.save();

    res.status(200).json({
      success: true,
      image,
    });
  } catch (error) {
    logger.error('Resim güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resim güncellenirken bir hata oluştu',
    });
  }
};

// Resim sil
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resim ID',
      });
    }

    const image = await SiteImage.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı',
      });
    }

    // Fiziksel dosyayı sil - path'e göre doğru klasörü bul
    let filePath: string | null = null;

    // ÖNCE: Tüm olası path'leri kontrol et (path'e bakmadan)
    const allPossiblePaths = [
      // ÖNCE general klasörünü kontrol et (dosyalar genelde orada)
      path.join(process.cwd(), 'uploads', 'general', image.filename),
      // Sonra path'teki klasörü kontrol et
      image.path ? path.join(process.cwd(), 'uploads', image.path) : null,
      // Path formatlarına göre
      image.path && image.path.startsWith('/uploads/')
        ? path.join(process.cwd(), image.path.substring(1))
        : null,
      image.path && image.path.startsWith('uploads/')
        ? path.join(process.cwd(), image.path)
        : null,
      // Category klasörleri
      image.category ? path.join(process.cwd(), 'uploads', image.category, image.filename) : null,
      path.join(process.cwd(), 'uploads', 'videos', image.filename),
      path.join(process.cwd(), 'uploads', 'site-images', image.filename),
    ].filter((p): p is string => p !== null);

    // İlk bulunan dosyayı kullan
    for (const possiblePath of allPossiblePaths) {
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath;
        break;
      }
    }

    // Dosyayı sil
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`Fiziksel dosya silindi: ${filePath}`);
      } catch (error) {
        logger.warn(`Fiziksel dosya silinemedi: ${filePath}`, error);
      }
    } else {
      logger.warn(`Fiziksel dosya bulunamadı: ${filePath || 'path belirlenemedi'}`, {
        imageId: id,
        image: {
          path: image.path,
          filename: image.filename,
          category: image.category
        }
      });
    }

    // Veritabanından sil
    await image.deleteOne();

    logger.info(`Resim silindi: ${image.filename} by user ${req.user?.id}`);

    res.status(200).json({
      success: true,
      message: 'Resim başarıyla silindi',
    });
  } catch (error) {
    logger.error('Resim silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resim silinirken bir hata oluştu',
    });
  }
};

// Toplu resim sil
export const deleteMultipleImages = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Silinecek resim ID\'leri gereklidir',
      });
    }

    // Geçerli ID'leri filtrele
    const validIds = ids.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli resim ID\'si bulunamadı',
      });
    }

    // Resimleri bul ve sil
    const images = await SiteImage.find({ _id: { $in: validIds } });

    // Fiziksel dosyaları sil - path'e göre doğru klasörü bul
    for (const image of images) {
      let filePath: string | null = null;

      // ÖNCE: Tüm olası path'leri kontrol et (path'e bakmadan)
      const allPossiblePaths = [
        // ÖNCE general klasörünü kontrol et (dosyalar genelde orada)
        path.join(process.cwd(), 'uploads', 'general', image.filename),
        // Sonra path'teki klasörü kontrol et
        image.path ? path.join(process.cwd(), 'uploads', image.path) : null,
        // Path formatlarına göre
        image.path && image.path.startsWith('/uploads/')
          ? path.join(process.cwd(), image.path.substring(1))
          : null,
        image.path && image.path.startsWith('uploads/')
          ? path.join(process.cwd(), image.path)
          : null,
        // Category klasörleri
        image.category ? path.join(process.cwd(), 'uploads', image.category, image.filename) : null,
        path.join(process.cwd(), 'uploads', 'videos', image.filename),
        path.join(process.cwd(), 'uploads', 'site-images', image.filename),
      ].filter((p): p is string => p !== null);

      // İlk bulunan dosyayı kullan
      for (const possiblePath of allPossiblePaths) {
        if (fs.existsSync(possiblePath)) {
          filePath = possiblePath;
          break;
        }
      }

      // Dosyayı sil
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.info(`Fiziksel dosya silindi: ${filePath}`);
        } catch (error) {
          logger.warn(`Fiziksel dosya silinemedi: ${filePath}`, error);
        }
      } else {
        logger.warn(`Fiziksel dosya bulunamadı: ${filePath || 'path belirlenemedi'}`, {
          imageId: image._id,
          image: {
            path: image.path,
            filename: image.filename,
            category: image.category
          }
        });
      }
    }

    // Veritabanından sil
    const result = await SiteImage.deleteMany({ _id: { $in: validIds } });

    logger.info(`${result.deletedCount} resim silindi by user ${req.user?.id}`);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} resim başarıyla silindi`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error('Toplu resim silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resimler silinirken bir hata oluştu',
    });
  }
};

// Resimleri toplu güncelle (sıralama için)
export const updateImageOrder = async (req: Request, res: Response) => {
  try {
    const { images } = req.body; // [{ id, order }, ...]

    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Resim listesi gereklidir',
      });
    }

    const updatePromises = images.map(({ id, order }: { id: string; order: number }) =>
      SiteImage.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Resim sıralaması güncellendi',
    });
  } catch (error) {
    logger.error('Resim sıralama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resim sıralaması güncellenirken bir hata oluştu',
    });
  }
};

