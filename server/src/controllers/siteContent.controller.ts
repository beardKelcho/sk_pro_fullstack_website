import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import mongoose from 'mongoose';
import logger from '../utils/logger';

import SiteImage from '../models/SiteImage';

// Helper: İçerik URL'lerini düzelt (Async - ID resolution ile)
const fixContentUrls = async (content: any): Promise<any> => {
  if (!content) return content;

  // KESİN KURAL: Environment ne olursa olsun Cloudinary kullanıyoruz
  const cdnBaseUrl = 'https://res.cloudinary.com/dmeviky6f';

  // Değiştirilecek URL adaylarını ve ID'lerini topla
  const idsToResolve = new Set<string>();
  const urlMap = new Map<string, { type: 'image' | 'video', originalUrl: string }>();

  // URL'den ID çıkaran ve listeye ekleyen yardımcı
  const collectId = (url: string | undefined, type: 'image' | 'video' = 'image') => {
    if (!url) return;

    // Cloudinary ise atla (Zaten düzgünse ellemeyeceğiz)
    if (url.includes('cloudinary.com')) return;

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

  // URL İnşa Edici - Hybrid Strict Mode
  const buildStrictUrl = (filename: string | undefined, existingUrl: string | undefined, type: 'image' | 'video'): string => {

    // 1. ÖNCELİK: Mevcut URL geçerli bir Cloudinary URL'i ise KORU.
    // (Çünkü içinde 'site-images/' gibi DB filename'de olmayan klasör bilgisi olabilir)
    if (existingUrl && typeof existingUrl === 'string' && existingUrl.includes('cloudinary.com')) {
      let finalUrl = existingUrl;

      // Sadece HTTPS düzeltmesi yap
      if (finalUrl.startsWith('http:')) {
        finalUrl = finalUrl.replace('http:', 'https:');
      } else if (!finalUrl.startsWith('https:')) {
        finalUrl = `https://${finalUrl.replace(/^\/\//, '')}`;
      }
      return finalUrl;
    }

    // 2. Filename varsa ve URL yerel/bozuk ise SIFIRDAN İNŞA ET
    if (filename && typeof filename === 'string') {
      // Klasör yollarını temizle: "videos/intro.mp4" -> "intro.mp4"
      // User isteği: "fazladan klasör yollarını temizle"
      let cleanFilename = filename.split('/').pop() || filename;

      let resourceType = type;
      const ext = cleanFilename.split('.').pop()?.toLowerCase();
      const hasExt = ext && (ext.length === 3 || ext.length === 4);

      // Uzantı eksikse ekle
      if (!hasExt) {
        if (resourceType === 'video') cleanFilename += '.mp4';
        else cleanFilename += '.jpg';
      }

      // Strict Format: https://res.cloudinary.com/dmeviky6f/[type]/upload/v1/[filename]
      return `${cdnBaseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
    }

    return '';
  };

  const resolveUrl = (inputUrl: string | undefined, inputFilename: string | undefined, type: 'image' | 'video'): string | undefined => {
    // 1. Input URL zaten Cloudinary ise direkt onu ver (HTTPS yapıp)
    if (inputUrl && inputUrl.includes('cloudinary.com')) {
      return buildStrictUrl(undefined, inputUrl, type);
    }

    // 2. Input bir ID mi? (Local path veya direkt ID)
    let idCandidate = inputUrl;
    if (idCandidate && typeof idCandidate === 'string') {
      idCandidate = idCandidate.replace(/^\/?api\/site-images\//, '').replace(/^\/?uploads\//, '').replace(/^\//, '');

      if (mongoose.Types.ObjectId.isValid(idCandidate)) {
        const data = imageMap.get(idCandidate);
        if (data) {
          // Bulunan kayıttaki URL ve Filename'i kullanarak oluştur
          // Eğer data.url cloudinary ise onu kullanacak (Priority 1)
          return buildStrictUrl(data.filename, data.url, type);
        }
      }
    }

    // 3. Fallback: Filename varsa ondan üret
    if (inputFilename) {
      return buildStrictUrl(inputFilename, undefined, type);
    }

    // 4. Input URL varsa ondan üret (ama cloudinary değilse boş dönebilir strict modda)
    return buildStrictUrl(undefined, inputUrl, type);
  };

  // URL'leri güncelle
  if (fixedContent.backgroundVideo) fixedContent.backgroundVideo = resolveUrl(fixedContent.backgroundVideo, undefined, 'video');
  if (fixedContent.backgroundImage) fixedContent.backgroundImage = resolveUrl(fixedContent.backgroundImage, undefined, 'image');
  if (fixedContent.selectedVideo) fixedContent.selectedVideo = resolveUrl(fixedContent.selectedVideo, undefined, 'video');
  if (fixedContent.image) fixedContent.image = resolveUrl(fixedContent.image, undefined, 'image');

  // Video Pool (availableVideos)
  if (Array.isArray(fixedContent.availableVideos)) {
    fixedContent.availableVideos = fixedContent.availableVideos.map((video: any) => {
      // ID çözümleme logic'i
      let filename = video.filename;
      let url = video.url;

      // URL local path ise ID'den bulmaya çalış
      if (url && !url.includes('cloudinary.com')) {
        let id = url.replace(/^\/?api\/site-images\//, '').replace(/^\/?uploads\//, '').replace(/^\//, '');
        if (imageMap.has(id)) {
          const data = imageMap.get(id);
          filename = data.filename;
          url = data.url; // DB'deki orjinal URL'i al (bu önemli!)
        }
      }

      return {
        ...video,
        url: buildStrictUrl(filename, url, 'video')
      };
    });
  }

  if (Array.isArray(fixedContent.services)) {
    fixedContent.services = fixedContent.services.map((service: any) => ({
      ...service,
      icon: resolveUrl(service.icon, undefined, 'image') || service.icon
    }));
  }

  return fixedContent;
};

// ... Controller functions remain mostly the same structure, just calling await fixContentUrls ...

export const getAllContents = async (req: Request, res: Response) => {
  try {
    const { section, isActive } = req.query;
    const filters: any = {};
    if (section) filters.section = section;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const contents = await SiteContent.find(filters).sort({ order: 1, createdAt: -1 });
    // URL'leri düzelt
    const fixedContents = await Promise.all(contents.map(async (doc) => {
      const docObj = doc.toObject();
      docObj.content = await fixContentUrls(docObj.content);
      return docObj;
    }));

    res.status(200).json({ success: true, count: fixedContents.length, contents: fixedContents });
  } catch (error) {
    logger.error('İçerik listeleme hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

export const getContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const normalizedSection = section?.toLowerCase().trim();
    const content = await SiteContent.findOne({ section: normalizedSection, isActive: true });

    if (!content) return res.status(200).json({ success: true, message: 'İçerik bulunamadı', content: null });

    const docObj = content.toObject();
    docObj.content = await fixContentUrls(docObj.content);

    res.status(200).json({ success: true, content: docObj });
  } catch (error) {
    logger.error('İçerik detayları hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { section, content, order, isActive } = req.body;
    if (!section || !content) return res.status(400).json({ success: false, message: 'Bölüm ve içerik gereklidir' });

    const existingContent = await SiteContent.findOne({ section });
    if (existingContent) {
      existingContent.content = content;
      if (order !== undefined) existingContent.order = order;
      if (isActive !== undefined) existingContent.isActive = isActive;
      await existingContent.save();

      const docObj = existingContent.toObject();
      docObj.content = await fixContentUrls(docObj.content);
      return res.status(200).json({ success: true, content: docObj });
    }

    const newContent = await SiteContent.create({ section, content, order: order || 0, isActive: isActive !== undefined ? isActive : true });

    const docObj = newContent.toObject();
    docObj.content = await fixContentUrls(docObj.content);
    res.status(201).json({ success: true, content: docObj });
  } catch (error) {
    logger.error('İçerik oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'İçerik oluşturulurken bir hata oluştu' });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, order, isActive } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });

    const siteContent = await SiteContent.findById(id);
    if (!siteContent) return res.status(404).json({ success: false });

    if (content) siteContent.content = content;
    if (order !== undefined) siteContent.order = order;
    if (isActive !== undefined) siteContent.isActive = isActive;

    await siteContent.save();

    const docObj = siteContent.toObject();
    docObj.content = await fixContentUrls(docObj.content);
    res.status(200).json({ success: true, content: docObj });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({ success: false });
  }
};

export const updateContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { content, order, isActive } = req.body;
    let siteContent = await SiteContent.findOne({ section });

    if (!siteContent) {
      siteContent = await SiteContent.create({ section, content: content || {}, order: order || 0, isActive: isActive !== undefined ? isActive : true });
    } else {
      if (content) siteContent.content = content;
      if (order !== undefined) siteContent.order = order;
      if (isActive !== undefined) siteContent.isActive = isActive;
      await siteContent.save();
    }

    const docObj = siteContent.toObject();
    docObj.content = await fixContentUrls(docObj.content);
    res.status(200).json({ success: true, content: docObj });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({ success: false });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });
    await SiteContent.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
