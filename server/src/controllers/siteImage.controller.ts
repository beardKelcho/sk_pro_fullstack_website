import { Request, Response } from 'express';
import siteService from '../services/site.service';
import logger from '../utils/logger';
import { AppError } from '../types/common';
import path from 'path';
import fs from 'fs';
// Direct model access only for serveImageById logic if needed, or move serve logic to service?

// For serveImageById, which deals with FS directly, it might be better to verify it still works.
// The service has helpers for fixing URLs, but serving local files is specific.
// I'll reuse the logic but encapsulated slightly better or keep it here if it's purely IO controller stuff.
// Given strict instructions, let's keep logic minimal here.

export const getAllImages = async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;
    const images = await siteService.listImages(
      category as string,
      isActive !== undefined ? isActive === 'true' : undefined
    );
    res.status(200).json({ success: true, count: images.length, images });
  } catch (error: unknown) {
    logger.error('Resim listeleme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = await siteService.getImageById(id);
    res.status(200).json({ success: true, image });
  } catch (error: unknown) {
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const serveImageById = async (req: Request, res: Response) => {
  // This is a direct file stream handler, so simpler to keep logic or move to a streamService.
  // Ideally user wants all logic in service. 
  // The previous implementation accessed DB to get path.
  // I will keep the FS logic but use service to retrieve metadata?
  // Actually, serveImageById is legacy "local file serving".
  // I will try to respect strict separation but for streams, controller handling it is acceptable.
  // However, I will check DB via service implicitly? No, service returns plain object with fixed URL.
  // Raw DB access is needed for local path if 'fixedUrl' transforms it.
  // Original logic: image.path || uploads/...
  // I'll keep this specific handler logic here but use standard error handling.
  try {
    const { id } = req.params;
    // Direct model access is explicitly allowed for streaming/binary cases often, 
    // but lets try to be clean.
    // I will replicate logic from old controller. 
    // NOTE: Does 'siteService.getImageById' return 'path'? Yes, toObject().

    const image = await siteService.getImageById(id); // Throws 404 if missing

    if (image.url) {
      // Redirect to Cloudinary or external URL
      return res.redirect(image.url);
    }

    // Fallback for very old local images if any (this part mostly won't work on Vercel but keeps type safety)
    return res.status(404).send('Resim URL bulunamadı');
  } catch (error: unknown) {
    // AppErrors threw by service
    const appError = error instanceof AppError ? error : new AppError('Hata');
    res.status(appError.statusCode || 500).send(appError.message);
  }
};

export const createImage = async (req: Request, res: Response) => {
  try {
    let imageData = req.body;

    // Eğer dosya yüklendiyse, uploadService ile işle ve veriyi hazırla
    if (req.file) {
      const uploadService = require('../services/upload.service').default;
      // Allow specific categories like 'hero', 'about', 'project' to be used as folders
      // If category is 'video', it puts it in 'video' folder. If 'hero', in 'hero' folder.
      const fileType = imageData.category || 'general';

      const uploadedFile = await uploadService.uploadFile(req.file, fileType, req.user?.id);

      imageData = {
        ...imageData,
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        path: uploadedFile.path,
        url: uploadedFile.url,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size
      };
    }

    const image = await siteService.createImage(imageData);
    res.status(201).json({ success: true, image });
  } catch (error: unknown) {
    logger.error('Resim oluşturma hatası:', error); // Add Logging
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let imageData = req.body;

    // Eğer yeni dosya yüklendiyse
    if (req.file) {
      const uploadService = require('../services/upload.service').default;

      // 1. Önce eski resmi bul ve sil
      try {
        const oldImage = await siteService.getImageById(id);
        if (oldImage && oldImage.filename) {
          // Cloudinary'den eski resmi sil
          // Not: category'yi de geçmek önemli, çünkü public_id klasör içeriyor olabilir veya folder append ediliyor olabilir
          await uploadService.deleteFile(oldImage.filename, oldImage.category || 'general');
        }
      } catch (err) {
        logger.warn(`Eski resim silinirken hata (Update sırasında): ${err}`);
      }

      // 2. Yeni resmi yükle
      const fileType = imageData.category || 'general';
      const uploadedFile = await uploadService.uploadFile(req.file, fileType, req.user?.id);

      imageData = {
        ...imageData,
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        path: uploadedFile.path,
        url: uploadedFile.url,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size
      };
    }

    const image = await siteService.updateImage(id, imageData);
    res.status(200).json({ success: true, image });
  } catch (error: unknown) {
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Resim bilgisini al
    const image = await siteService.getImageById(id);

    // Cloudinary veya Local'dan sil
    // Not: image.path genellikle Cloudinary public_id'si veya local path'idir.
    // Ancak uploadService'imiz filename veya public_id üzerinden çalışıyor.
    // Cloudinary için path veya filename'i public_id olarak kullanabiliriz.
    const uploadService = require('../services/upload.service').default;

    // image.path: "project/xyz123" (Cloudinary public_id) veya "project/file.jpg" (Local)
    // image.filename: "xyz123" veya "file.jpg"

    // Upload service deleteFile fonksiyonu "filename" ve "type" alıyor.
    // Cloudinary için filename aslında path'in kendisi gibi davranmalı veya public_id olmalı.
    // Eğer image.path bir public_id ise (klasör içeriyorsa), bunu filename olarak gönderemeyiz çünkü
    // deleteFile fonksiyonu tip + filename birleştiriyor.

    // Bu yüzden direkt Cloudinary service'i çağırmak veya logic'i düzeltmek gerek.
    // En temizi uploadService'i güncellemek ama şimdilik controller içinde çözelim:

    if (image.path) {
      try {
        // Eğer path 'uploads/' ile başlamıyorsa ve cloud storage ise, bu bir public_id'dir.
        // Veya direkt uploadService.deleteFile çağırabiliriz, o içeride logic kurabilir.
        // Mevcut uploadService.deleteFile:
        // Cloudinary -> publicId = `${type}/${filename}`
        // Bu logic "project/myimage.jpg" gibi bir public_id varsayıyor.

        // Bizim image.path'imiz muhtemelen "project/myimage.jpg" formatında.
        // image.filename ise "myimage.jpg" olabilir.
        // image.category ise "project" olabilir.

        // UploadService.deleteFile(image.filename, image.category) çağırırsak:
        // -> "project/myimage.jpg" silinir. Bu doğru görünüyor.

        await uploadService.deleteFile(image.filename, image.category || 'general');
      } catch (err) {
        logger.warn(`Dosya silinirken hata (DB'den silinecek): ${err}`);
      }
    }

    await siteService.deleteImage(id);
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error: unknown) {
    logger.error('Resim silme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const deleteMultipleImages = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ success: false });

    // Her bir resmi bul ve dosyasını sil
    const uploadService = require('../services/upload.service').default;

    // Paralel işlem yapma, tek tek güvenli gitsin
    for (const id of ids) {
      try {
        const image = await siteService.getImageById(id);
        if (image && image.filename) {
          await uploadService.deleteFile(image.filename, image.category || 'general');
        }
      } catch (err) {
        logger.warn(`Toplu silme sırasında dosya silme hatası (ID: ${id}):`, err);
      }
    }

    await siteService.deleteMultipleImages(ids);
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error: unknown) {
    logger.error('Toplu resim silme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const updateImageOrder = async (req: Request, res: Response) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images)) return res.status(400).json({ success: false });

    await siteService.updateImageOrders(images);
    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};
