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
    // Eğer zaten full absolute path ise ve id değilse atla
    // Ama ID kontrolü için yine de bakmalıyız, belki manual girilmiş bir ID'dir.

    // Local path formatları: /api/site-images/:id, /uploads/:id, :id
    let idCandidate = url;
    if (url.startsWith('http')) {
      // HTTP ile başlıyorsa ve Cloudinary değilse ID olabilir mi? Zor.
      // Genelde local pathler http ile başlamaz backend tarafında (veritabanında)
      // Ama yine de kontrol edelim.
      if (url.includes('cloudinary.com')) return;
    }

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
      imageMap.set(img._id.toString(), {
        filename: img.filename,
        url: img.url
      });
    });
  }

  // URL İnşa Edici - Strict Mode
  const buildStrictUrl = (filename: string | undefined, existingUrl: string | undefined, type: 'image' | 'video'): string => {
    // 1. Filename varsa SIFIRDAN İNŞA ET (En güvenli yol)
    if (filename && typeof filename === 'string') {
      // Klasör yollarını temizle: "videos/intro.mp4" -> "intro.mp4"
      let cleanFilename = filename.split('/').pop() || filename;

      const ext = cleanFilename.split('.').pop()?.toLowerCase();
      const hasExt = ext && (ext.length === 3 || ext.length === 4);

      let resourceType = type;
      // Extension yoksa ekle
      if (!hasExt) {
        if (resourceType === 'video') cleanFilename += '.mp4';
        else cleanFilename += '.jpg';
      }

      // Strict Format: https://res.cloudinary.com/dmeviky6f/[type]/upload/v1/[filename]
      return `${cdnBaseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
    }

    // 2. Filename yoksa, mevcut URL'i tamir et
    if (existingUrl && typeof existingUrl === 'string') {
      let finalUrl = existingUrl;

      // Relative path kontrolü: Başında site adresi yoksa ekleme, directly cloudinary yap.
      // Eğer "cloudinary.com" içermiyorsa ve http ile başlamıyorsa, bu muhtemelen bozuk bir local pathtir.
      // Bu durumda boş string dönmek daha güvenlidir (frontend crash olmasın diye) veya default.

      if (finalUrl.includes('cloudinary.com')) {
        // Protokolü https yap
        if (finalUrl.startsWith('http:')) {
          finalUrl = finalUrl.replace('http:', 'https:');
        } else if (!finalUrl.startsWith('https:')) {
          // Protokol yoksa ekle
          return `https://${finalUrl.replace(/^\/\//, '')}`;
        }
        return finalUrl;
      }

      // Cloudinary değilse ve filename de bulunamadıysa...
      // Belki de external bir link? (Youtube vs.)
      if (finalUrl.startsWith('http')) return finalUrl;

      // Ne olduğu belirsiz, boş dön.
      return '';
    }

    return '';
  };

  const resolveUrl = (inputUrl: string | undefined, inputFilename: string | undefined, type: 'image' | 'video'): string | undefined => {
    // Filename varsa direkt build et
    if (inputFilename) return buildStrictUrl(inputFilename, undefined, type);

    if (!inputUrl) return inputUrl;

    // inputUrl bir ID olabilir mi?
    let idCandidate = inputUrl.replace(/^\/?api\/site-images\//, '').replace(/^\/?uploads\//, '').replace(/^\//, '');

    // URL map veya doğrudan ID kontrolü
    if (mongoose.Types.ObjectId.isValid(idCandidate)) {
      const data = imageMap.get(idCandidate);
      if (data) {
        return buildStrictUrl(data.filename, data.url, type);
      }
    }

    // ID değilse, mevcut URL'i fixle
    return buildStrictUrl(undefined, inputUrl, type);
  };

  // URL'leri güncelle
  if (fixedContent.backgroundVideo) fixedContent.backgroundVideo = resolveUrl(fixedContent.backgroundVideo, undefined, 'video');
  if (fixedContent.backgroundImage) fixedContent.backgroundImage = resolveUrl(fixedContent.backgroundImage, undefined, 'image');
  if (fixedContent.selectedVideo) fixedContent.selectedVideo = resolveUrl(fixedContent.selectedVideo, undefined, 'video');
  if (fixedContent.image) fixedContent.image = resolveUrl(fixedContent.image, undefined, 'image');

  // Video Pool (availableVideos) - ÖZEL İLGİ
  if (Array.isArray(fixedContent.availableVideos)) {
    fixedContent.availableVideos = fixedContent.availableVideos.map((video: any) => {
      // 1. Filename'i bul
      let filename = video.filename;

      // 2. Filename yoksa ID'den bul
      if (!filename && video.url) {
        let id = video.url.replace(/^\/?api\/site-images\//, '').replace(/^\/?uploads\//, '').replace(/^\//, '');
        if (imageMap.has(id)) {
          filename = imageMap.get(id).filename;
        }
      }

      // 3. Filename bulunduysa SIFIRDAN URL oluştur
      if (filename) {
        return {
          ...video,
          url: buildStrictUrl(filename, undefined, 'video')
        };
      }

      // 4. Bulunamadıysa mevcut URL'i temizle
      return {
        ...video,
        url: buildStrictUrl(undefined, video.url, 'video')
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

// Tüm içerikleri listele
export const getAllContents = async (req: Request, res: Response) => {
  try {
    const { section, isActive } = req.query;

    const filters: any = {};
    if (section) filters.section = section;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const contents = await SiteContent.find(filters).sort({ order: 1, createdAt: -1 });

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
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

// Tek bir içeriği getir
export const getContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const normalizedSection = section?.toLowerCase().trim();

    const content = await SiteContent.findOne({
      section: normalizedSection,
      isActive: true
    });

    if (!content) {
      return res.status(200).json({
        success: true,
        message: 'İçerik bulunamadı',
        content: null,
      });
    }

    const docObj = content.toObject();
    docObj.content = await fixContentUrls(docObj.content);

    res.status(200).json({
      success: true,
      content: docObj,
    });
  } catch (error) {
    logger.error('İçerik getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

// Yeni içerik oluştur (Admin)
export const createContent = async (req: Request, res: Response) => {
  try {
    const { section, content, order, isActive } = req.body;

    if (!section || !content) {
      return res.status(400).json({ success: false, message: 'Eksik bilgi' });
    }

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

    const newContent = await SiteContent.create({
      section,
      content,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const docObj = newContent.toObject();
    docObj.content = await fixContentUrls(docObj.content);

    res.status(201).json({ success: true, content: docObj });
  } catch (error) {
    logger.error('İçerik oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

// İçerik güncelle (Admin)
export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, order, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz ID' });
    }

    const siteContent = await SiteContent.findById(id);
    if (!siteContent) {
      return res.status(404).json({ success: false, message: 'Bulunamadı' });
    }

    if (content) siteContent.content = content;
    if (order !== undefined) siteContent.order = order;
    if (isActive !== undefined) siteContent.isActive = isActive;

    await siteContent.save();

    const docObj = siteContent.toObject();
    docObj.content = await fixContentUrls(docObj.content);

    res.status(200).json({ success: true, content: docObj });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

// Section ile güncelle
export const updateContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { content, order, isActive } = req.body;

    let siteContent = await SiteContent.findOne({ section });

    if (!siteContent) {
      siteContent = await SiteContent.create({
        section,
        content: content || {},
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      });
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
    logger.error('Section güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

// Sil
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
