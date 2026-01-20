import { Request, Response } from 'express';
import SiteImage from '../models/SiteImage';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Helper: Resim URL'lerini düzelt (Cloudinary uyumluluğu için)
const fixImageUrls = (image: any): any => {
  if (!image) return image;

  const fixUrl = (filename: string, existingUrl: string | undefined, category: string): string => {
    // Hardcoded Base URL
    const cdnBaseUrl = 'https://res.cloudinary.com/dmeviky6f';

    // 1. ÖNCELİK: Mevcut URL geçerli bir Cloudinary URL'i ise KORU.
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
      let cleanFilename = filename.split('/').pop() || filename;

      let resourceType = 'image';
      const ext = cleanFilename.split('.').pop()?.toLowerCase();
      const hasExt = ext && (ext.length === 3 || ext.length === 4);

      if (category === 'video' || (hasExt && ['mp4', 'webm', 'mov', 'avi'].includes(ext!))) {
        resourceType = 'video';
      }

      if (!hasExt) {
        if (resourceType === 'video') cleanFilename += '.mp4';
        else cleanFilename += '.jpg';
      }

      return `${cdnBaseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
    }

    return '';
  };

  const fixedImage = JSON.parse(JSON.stringify(image));

  if (fixedImage.filename || fixedImage.url) {
    fixedImage.url = fixUrl(fixedImage.filename, fixedImage.url, fixedImage.category || 'gallery');
  }

  return fixedImage;
};

// ... Controller functions ...

export const getAllImages = async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;
    const filters: any = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const images = await SiteImage.find(filters).sort({ category: 1, order: 1, createdAt: -1 });

    const fixedImages = images.map(img => {
      const imgObj = img.toObject();
      return fixImageUrls(imgObj);
    });

    res.status(200).json({ success: true, count: fixedImages.length, images: fixedImages });
  } catch (error) {
    logger.error('Resim listeleme hatası:', error);
    res.status(500).json({ success: false, message: 'Hata oluştu' });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });

    const image = await SiteImage.findById(id);
    if (!image) return res.status(404).json({ success: false, message: 'Bulunamadı' });

    const imgObj = image.toObject();
    const fixedImage = fixImageUrls(imgObj);

    res.status(200).json({ success: true, image: fixedImage });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const serveImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('Geçersiz ID');

    const image = await SiteImage.findById(id);
    if (!image) return res.status(404).send('Bulunamadı');

    const category = image.category || 'general';
    const possiblePaths = [
      image.path ? path.join(process.cwd(), 'uploads', image.path.replace(/^\/?uploads\//, '')) : null,
      path.join(process.cwd(), 'uploads', category, image.filename),
      path.join(process.cwd(), 'uploads', 'general', image.filename),
    ].filter(p => p);

    let filePath: string | undefined;
    for (const p of possiblePaths) {
      if (p && fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) return res.status(404).send('Dosya bulunamadı');

    const ext = path.extname(image.filename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.png') contentType = 'image/png';

    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).send('Hata');
  }
};

export const createImage = async (req: Request, res: Response) => {
  try {
    const { filename, originalName, path: filePath, url, category, order } = req.body;
    if (!filename || !originalName || !filePath || !url) return res.status(400).json({ success: false });

    const image = await SiteImage.create({
      filename, originalName, path: filePath, url,
      category: category || 'gallery', order: order || 0, isActive: true
    });

    res.status(201).json({ success: true, image });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, order, isActive } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });

    const image = await SiteImage.findById(id);
    if (!image) return res.status(404).json({ success: false });

    if (category) image.category = category;
    if (order !== undefined) image.order = order;
    if (isActive !== undefined) image.isActive = isActive;

    await image.save();
    res.status(200).json({ success: true, image });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });
    const image = await SiteImage.findById(id);
    if (!image) return res.status(404).json({ success: false });
    await image.deleteOne();
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deleteMultipleImages = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ success: false });
    await SiteImage.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

export const updateImageOrder = async (req: Request, res: Response) => {
  try {
    const { images } = req.body;
    await Promise.all(images.map(({ id, order }: any) => SiteImage.findByIdAndUpdate(id, { order })));
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
