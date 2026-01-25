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
      const fileType = imageData.category === 'video' ? 'video' : 'general'; // category'den tip belirle

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
    const image = await siteService.updateImage(id, req.body);
    res.status(200).json({ success: true, image });
  } catch (error: unknown) {
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await siteService.deleteImage(id);
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error: unknown) {
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const deleteMultipleImages = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ success: false });
    await siteService.deleteMultipleImages(ids);
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error: unknown) {
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
