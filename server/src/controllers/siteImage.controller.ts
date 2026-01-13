import { Request, Response } from 'express';
import SiteImage from '../models/SiteImage';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

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
    
    res.status(200).json({
      success: true,
      count: images.length,
      images,
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
    
    res.status(200).json({
      success: true,
      image,
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
    // Path formatı: "site-images/filename.jpg" veya "general/filename.jpg" veya "images/slide1.jpg" (client/public/images) veya "/uploads/site-images/filename.jpg" veya direkt "filename.jpg"
    let filePath: string;
    
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
        // "/images/slide1.jpg" veya "images/slide1.jpg" formatı - client/public/images klasöründe
        const imageFileName = image.path.replace(/^\/?images\//, '');
        filePath = path.join(process.cwd(), 'client', 'public', 'images', imageFileName);
      } else if (image.path.startsWith('/')) {
        // "/site-images/filename.jpg" formatı
        filePath = path.join(process.cwd(), 'uploads', image.path.substring(1));
      } else {
        // "site-images/filename.jpg" veya "general/filename.jpg" veya direkt "filename.jpg" formatı
        filePath = path.join(process.cwd(), 'uploads', image.path);
      }
    } else if (image.filename) {
      // Path yoksa, filename'den oluştur - önce site-images, sonra general klasörünü dene
      filePath = path.join(process.cwd(), 'uploads', 'site-images', image.filename);
    } else {
      logger.error(`Resim path ve filename eksik: ${id}`, image);
      return res.status(404).send('Resim dosya bilgisi bulunamadı');
    }
    
    // Dosya var mı kontrol et - birden fazla yerde ara
    if (!fs.existsSync(filePath)) {
      // Alternatif yolları dene - path'ten klasör adını çıkar veya farklı klasörleri dene
      const pathParts = image.path ? image.path.split('/') : [];
      const categoryFromPath = pathParts.length > 0 ? pathParts[0] : null;
      
      const alternativePaths = [
        // Path'teki kategori ile (eğer path varsa)
        categoryFromPath && !image.path.startsWith('images/') ? path.join(process.cwd(), 'uploads', image.path) : null,
        // images/ ile başlayan path'ler için client/public/images
        image.path && (image.path.startsWith('images/') || image.path.startsWith('/images/')) 
          ? path.join(process.cwd(), 'client', 'public', 'images', image.filename)
          : null,
        // site-images klasörü
        path.join(process.cwd(), 'uploads', 'site-images', image.filename),
        // general klasörü (upload route'u bazen general'a kaydediyor)
        path.join(process.cwd(), 'uploads', 'general', image.filename),
        // client/public/images klasörü (eski resimler için - direkt filename ile)
        path.join(process.cwd(), 'client', 'public', 'images', image.filename),
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
    
    // Content-Type'ı ayarla
    const ext = path.extname(image.filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';
    
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
    
    // Fiziksel dosyayı sil
    // Önce uploads klasöründe dene
    let filePath = path.join(process.cwd(), 'uploads', 'site-images', image.filename);
    if (!fs.existsSync(filePath)) {
      // Sonra client/public/images altında dene
      filePath = path.join(process.cwd(), 'client', 'public', image.path);
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
    
    // Fiziksel dosyaları sil
    for (const image of images) {
      let filePath = path.join(process.cwd(), 'uploads', 'site-images', image.filename);
      if (!fs.existsSync(filePath)) {
        // Alternatif yolları dene
        const alternativePaths = [
          path.join(process.cwd(), 'uploads', 'general', image.filename),
          path.join(process.cwd(), 'client', 'public', 'images', image.filename),
        ];
        
        for (const altPath of alternativePaths) {
          if (fs.existsSync(altPath)) {
            filePath = altPath;
            break;
          }
        }
      }
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.info(`Fiziksel dosya silindi: ${filePath}`);
        } catch (error) {
          logger.warn(`Fiziksel dosya silinemedi: ${filePath}`, error);
        }
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

