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
  } catch (error: unknown) {
    // AppErrors threw by service
    const appError = error instanceof AppError ? error : new AppError('Hata');
    res.status(appError.statusCode || 500).send(appError.message);
  }
};

export const createImage = async (req: Request, res: Response) => {
  try {
    const image = await siteService.createImage(req.body);
    res.status(201).json({ success: true, image });
  } catch (error: unknown) {
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
