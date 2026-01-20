import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import mongoose from 'mongoose';
import logger from '../utils/logger';

import SiteImage from '../models/SiteImage';

// Helper: İçerik URL'lerini düzelt (Async - ID resolution ile)
const fixContentUrls = async (content: any): Promise<any> => {
  if (!content) return content;

  // KESİN KURAL: Environment ne olursa olsun Cloudinary kullanıyoruz
  // Base URL'i hardcode ediyoruz (User request: dmeviky6f)
  const cdnBaseUrl = 'https://res.cloudinary.com/dmeviky6f';

  // Değiştirilecek URL adaylarını ve ID'lerini topla
  const idsToResolve = new Set<string>();
  const urlMap = new Map<string, { type: 'image' | 'video', originalUrl: string }>();

  // URL'den ID çıkaran ve listeye ekleyen yardımcı
  const collectId = (url: string | undefined, type: 'image' | 'video' = 'image') => {
    if (!url) return;
    if (url.startsWith('http://') || url.startsWith('https://')) return;

    // Local path formatları: /api/site-images/:id, /uploads/:id, :id
    let idCandidate = url;
    idCandidate = idCandidate.replace(/^\/?api\/site-images\//, '');
    idCandidate = idCandidate.replace(/^\/?uploads\//, '');
    idCandidate = idCandidate.replace(/^\//, '');

    // Eğer ID geçerli bir MongoDB ID'si ise listeye ekle
    if (mongoose.Types.ObjectId.isValid(idCandidate)) {
      idsToResolve.add(idCandidate);
      urlMap.set(url, { type, originalUrl: url });
    }
  };

  // Content objesini kopyala
  const fixedContent = JSON.parse(JSON.stringify(content));

  // Alanları tara ve ID'leri topla
  collectId(fixedContent.backgroundVideo, 'video');
  collectId(fixedContent.backgroundImage, 'image');
  collectId(fixedContent.selectedVideo, 'video');
  collectId(fixedContent.image, 'image');

  if (Array.isArray(fixedContent.availableVideos)) {
    fixedContent.availableVideos.forEach((video: any) => collectId(video.url, 'video'));
  }

  if (Array.isArray(fixedContent.services)) {
    fixedContent.services.forEach((service: any) => collectId(service.icon, 'image'));
  }

  // Veritabanından dosyaları çek
  const imageMap = new Map(); // ID -> Filename
  if (idsToResolve.size > 0) {
    const images = await SiteImage.find({ _id: { $in: Array.from(idsToResolve) } });
    images.forEach(img => {
      // Hem filename hem de mevcut URL'i sakla
      imageMap.set(img._id.toString(), {
        filename: img.filename,
        url: img.url
      });
    });
  }

  // URL oluşturma (Builder)
  const buildCloudinaryUrl = (filename: string | undefined, existingUrl: string | undefined, type: 'image' | 'video'): string => {
    // Hardcoded Base URL
    const baseUrl = 'https://res.cloudinary.com/dmeviky6f';

    // 1. Filename varsa, SIFIRDAN ve TEMİZ bir URL oluştur
    if (filename && typeof filename === 'string') {
      // Filename temizliği: path separatorleri ve resource type'ları kaldır
      let cleanFilename = filename.split('/').pop() || filename;

      // Extension ve Resource Type belirle
      const ext = cleanFilename.split('.').pop()?.toLowerCase();
      const hasExt = ext && (ext.length === 3 || ext.length === 4);

      let resourceType = type;
      if (!hasExt) {
        if (resourceType === 'video') cleanFilename += '.mp4';
        else cleanFilename += '.jpg';
      }

      return `${baseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
    }

    // 2. Filename yoksa ama URL varsa, onu düzeltmeye çalış
    if (existingUrl && typeof existingUrl === 'string') {
      let finalUrl = existingUrl;

      // Sadece path ise başına domain ekle
      if (!finalUrl.startsWith('http')) {
        finalUrl = `https://${finalUrl.replace(/^\//, '')}`;
      }

      // HTTPS zorunlu
      if (finalUrl.startsWith('http:')) {
        finalUrl = finalUrl.replace('http:', 'https:');
      }

      // Eğer domain yoksa ekle (bazı durumlarda path olarak saklanmış olabilir)
      if (!finalUrl.includes('res.cloudinary.com')) {
        // Güvenli fallback: Eğer filename yoksa ve URL de bozuksa, video/image tipine göre default bir şey dönmek yerine
        // boş dönmek daha iyidir ki frontend 404 almasın, hiç render etmesin.
        // Ancak user "res.cloudinary.com/.../[filename]" istediği için, filename yoksa existingUrl'i döndürmek riskli.
        return '';
      }

      return finalUrl;
    }

    return '';
  };

  const resolveUrlOrFilename = (inputUrl: string | undefined, inputFilename: string | undefined, type: 'image' | 'video'): string | undefined => {
    // 1. Eğer input olarak filename verilmişse, direkt onu kullan
    if (inputFilename && typeof inputFilename === 'string') {
      return buildCloudinaryUrl(inputFilename, undefined, type);
    }

    // 2. Eğer URL yoksa dön
    if (!inputUrl || typeof inputUrl !== 'string') return inputUrl;

    // 3. Manuel Giriş Temizliği
    if (inputUrl.startsWith('http')) {
      // Cloudinary kontrolü
      if (inputUrl.includes('cloudinary.com')) {
        if (inputUrl.startsWith('http:')) return inputUrl.replace('http:', 'https:');
        return inputUrl;
      }
      // Eğer http ile başlıyor ama cloudinary değilse ve mongo id değilse olduğu gibi dön
      // Ancak bu relative path riskini taşır mı? Genelde hayır, absolute external linktir.
      return inputUrl;
    }

    // 4. URL map'ten kontrol et
    if (urlMap.has(inputUrl)) {
      let id = inputUrl;
      id = id.replace(/^\/?api\/site-images\//, '');
      id = id.replace(/^\/?uploads\//, '');
      id = id.replace(/^\//, '');

      const resolvedData = imageMap.get(id);
      if (resolvedData) {
        const fName = resolvedData.filename || '';
        const eUrl = resolvedData.url || '';
        return buildCloudinaryUrl(fName, eUrl, type);
      }
    }

    // 5. Fallback - ID olabilir
    if (mongoose.Types.ObjectId.isValid(inputUrl)) {
      const resolvedData = imageMap.get(inputUrl);
      if (resolvedData) {
        const fName = resolvedData.filename || '';
        const eUrl = resolvedData.url || '';
        return buildCloudinaryUrl(fName, eUrl, type);
      }
    }

    return inputUrl;
  };

  // URL'leri güncelle
  if (fixedContent.backgroundVideo) fixedContent.backgroundVideo = resolveUrlOrFilename(fixedContent.backgroundVideo, undefined, 'video');
  if (fixedContent.backgroundImage) fixedContent.backgroundImage = resolveUrlOrFilename(fixedContent.backgroundImage, undefined, 'image');
  if (fixedContent.selectedVideo) fixedContent.selectedVideo = resolveUrlOrFilename(fixedContent.selectedVideo, undefined, 'video');
  if (fixedContent.image) fixedContent.image = resolveUrlOrFilename(fixedContent.image, undefined, 'image');

  if (Array.isArray(fixedContent.availableVideos)) {
    fixedContent.availableVideos = fixedContent.availableVideos.map((video: any) => {
      // 1. Filename bulmaya çalış (Obje içinde varsa)
      let filename = video.filename;

      // 2. Eğer filename yoksa ID'den çöz
      if (!filename && video.url && typeof video.url === 'string') {
        let id = video.url;
        id = id.replace(/^\/?api\/site-images\//, '');
        id = id.replace(/^\/?uploads\//, '');
        id = id.replace(/^\//, '');

        if (imageMap.has(id)) {
          const data = imageMap.get(id);
          if (data) filename = data.filename;
        }
      }

      // 3. Filename varsa, SIFIRDAN URL oluştur
      if (filename) {
        return {
          ...video,
          url: buildCloudinaryUrl(filename, undefined, 'video')
        };
      }

      // Fallback
      return {
        ...video,
        url: resolveUrlOrFilename(video.url, undefined, 'video')
      };
    });
  }

  if (Array.isArray(fixedContent.services)) {
    fixedContent.services.forEach((service: any) => collectId(service.icon, 'image'));
    fixedContent.services = fixedContent.services.map((service: any) => ({
      ...service,
      icon: resolveUrlOrFilename(service.icon, undefined, 'image') || service.icon
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

    // URL'leri düzelt (Async map için Promise.all kullan)
    const fixedContents = await Promise.all(contents.map(async (doc) => {
      const docObj = doc.toObject();
      docObj.content = await fixContentUrls(docObj.content);
      return docObj;
    }));

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
    docObj.content = await fixContentUrls(docObj.content);

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
      docObj.content = await fixContentUrls(docObj.content);

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
    docObj.content = await fixContentUrls(docObj.content);

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
    docObj.content = await fixContentUrls(docObj.content);

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
    docObj.content = await fixContentUrls(docObj.content);

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
