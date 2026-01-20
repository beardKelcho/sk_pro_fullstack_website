import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Helper: İçerik URL'lerini düzelt
const fixContentUrls = (content: any): any => {
  if (!content) return content;

  // Storage type ve CDN URL'ini al
  const storageType = (process.env.STORAGE_TYPE || 'local').toLowerCase();
  const cdnBaseUrl = process.env.CLOUDINARY_CDN_URL || '';

  // URL düzeltme fonksiyonu
  const fixUrl = (url: string | undefined, type: 'image' | 'video' = 'image'): string | undefined => {
    if (!url) return url;

    // Zaten tam URL ise (http:// veya https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Cloudinary aktifse ve local path ise
    if (storageType === 'cloudinary' && cdnBaseUrl) {
      // Path temizleme: /api/site-images/, /uploads/ vb. kaldır
      let cleanPath = url;
      cleanPath = cleanPath.replace(/^\/?api\/site-images\//, '');
      cleanPath = cleanPath.replace(/^\/?uploads\//, '');
      cleanPath = cleanPath.replace(/^\//, ''); // Başındaki slash'i kaldır

      // Eğer cleanPath tamamen temizlendiyse veya boşsa orijinali dön
      if (!cleanPath) return url;

      // Dosya uzantısı kontrolü - eksikse ekle
      const ext = cleanPath.split('.').pop()?.toLowerCase();
      const hasExt = ext && (ext.length === 3 || ext.length === 4);

      if (!hasExt) {
        if (type === 'video') cleanPath += '.mp4';
        else cleanPath += '.jpg';
      }

      // Base URL hazırla (sonundaki slash'i kaldır)
      const baseUrl = cdnBaseUrl.replace(/\/$/, '');

      // Eğer URL zaten 'upload' içeriyorsa direkt birleştir (duplicate önlemek için)
      if (cleanPath.includes('upload/')) {
        return `${baseUrl}/${cleanPath}`;
      }

      // Strict Format: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v1/<public_id>.<format>
      return `${baseUrl}/${type}/upload/v1/${cleanPath}`;
    }

    return url;
  };

  // Content objesini kopyala
  const fixedContent = JSON.parse(JSON.stringify(content));

  // Alan bazlı type belirleme
  if (fixedContent.backgroundVideo) fixedContent.backgroundVideo = fixUrl(fixedContent.backgroundVideo, 'video');
  if (fixedContent.backgroundImage) fixedContent.backgroundImage = fixUrl(fixedContent.backgroundImage, 'image');
  if (fixedContent.selectedVideo) fixedContent.selectedVideo = fixUrl(fixedContent.selectedVideo, 'video');

  // Image alanları
  if (fixedContent.image) fixedContent.image = fixUrl(fixedContent.image, 'image');

  // availableVideos array'ini düzelt - HER ZAMAN VIDEO
  if (Array.isArray(fixedContent.availableVideos)) {
    fixedContent.availableVideos = fixedContent.availableVideos.map((video: any) => ({
      ...video,
      url: fixUrl(video.url, 'video')
    }));
  }

  // Services & Equipment (icon alanları)
  if (Array.isArray(fixedContent.services)) {
    fixedContent.services = fixedContent.services.map((service: any) => ({
      ...service,
      icon: fixUrl(service.icon, 'image') || service.icon
    }));
  }

  return fixedContent;
};

// Tüm içerikleri listele
export const getAllContents = async (req: Request, res: Response) => {
  try {
    const { section, isActive } = req.query;

    const filters: any = {};
    if (section) {
      filters.section = section;
    }
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const contents = await SiteContent.find(filters)
      .sort({ order: 1, createdAt: -1 });

    // URL'leri düzelt
    const fixedContents = contents.map(doc => {
      const docObj = doc.toObject();
      docObj.content = fixContentUrls(docObj.content);
      return docObj;
    });

    res.status(200).json({
      success: true,
      count: fixedContents.length,
      contents: fixedContents,
    });
  } catch (error) {
    logger.error('İçerik listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerikler listelenirken bir hata oluştu',
    });
  }
};

// Tek bir içeriği getir
export const getContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;

    // Section'ı lowercase yap ve normalize et
    const normalizedSection = section?.toLowerCase().trim();

    const content = await SiteContent.findOne({
      section: normalizedSection,
      isActive: true
    });

    // Eğer içerik yoksa, boş bir response döndür (404 yerine 200 ile boş data)
    if (!content) {
      return res.status(200).json({
        success: true,
        message: 'İçerik bulunamadı, varsayılan içerik kullanılabilir',
        content: null,
      });
    }

    // URL'leri düzelt ve content objesini güncelle
    const docObj = content.toObject();
    docObj.content = fixContentUrls(docObj.content);

    res.status(200).json({
      success: true,
      content: docObj,
    });
  } catch (error) {
    logger.error('İçerik detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni içerik oluştur
export const createContent = async (req: Request, res: Response) => {
  try {
    const { section, content, order, isActive } = req.body;

    if (!section || !content) {
      return res.status(400).json({
        success: false,
        message: 'Bölüm ve içerik gereklidir',
      });
    }

    // Aynı section'da zaten içerik varsa güncelle
    const existingContent = await SiteContent.findOne({ section });
    if (existingContent) {
      existingContent.content = content;
      if (order !== undefined) existingContent.order = order;
      if (isActive !== undefined) existingContent.isActive = isActive;
      await existingContent.save();

      const docObj = existingContent.toObject();
      docObj.content = fixContentUrls(docObj.content);

      return res.status(200).json({
        success: true,
        content: docObj,
        message: 'İçerik güncellendi',
      });
    }

    const newContent = await SiteContent.create({
      section,
      content,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const docObj = newContent.toObject();
    docObj.content = fixContentUrls(docObj.content);

    res.status(201).json({
      success: true,
      content: docObj,
    });
  } catch (error) {
    logger.error('İçerik oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik oluşturulurken bir hata oluştu',
    });
  }
};

// İçerik güncelle
export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, order, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz içerik ID',
      });
    }

    const siteContent = await SiteContent.findById(id);
    if (!siteContent) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı',
      });
    }

    if (content) siteContent.content = content;
    if (order !== undefined) siteContent.order = order;
    if (isActive !== undefined) siteContent.isActive = isActive;

    await siteContent.save();

    const docObj = siteContent.toObject();
    docObj.content = fixContentUrls(docObj.content);

    res.status(200).json({
      success: true,
      content: docObj,
    });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik güncellenirken bir hata oluştu',
    });
  }
};

// Section'a göre içerik güncelle
export const updateContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { content, order, isActive } = req.body;

    let siteContent = await SiteContent.findOne({ section });

    if (!siteContent) {
      // Eğer içerik yoksa oluştur
      siteContent = await SiteContent.create({
        section,
        content: content || {},
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      });
    } else {
      // Varsa güncelle
      if (content) siteContent.content = content;
      if (order !== undefined) siteContent.order = order;
      if (isActive !== undefined) siteContent.isActive = isActive;
      await siteContent.save();
    }

    const docObj = siteContent.toObject();
    docObj.content = fixContentUrls(docObj.content);

    res.status(200).json({
      success: true,
      content: docObj,
    });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik güncellenirken bir hata oluştu',
    });
  }
};

// İçerik sil
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz içerik ID',
      });
    }

    const content = await SiteContent.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı',
      });
    }

    await content.deleteOne();

    logger.info(`İçerik silindi: ${content.section} by user ${req.user?.id}`);

    res.status(200).json({
      success: true,
      message: 'İçerik başarıyla silindi',
    });
  } catch (error) {
    logger.error('İçerik silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik silinirken bir hata oluştu',
    });
  }
};

