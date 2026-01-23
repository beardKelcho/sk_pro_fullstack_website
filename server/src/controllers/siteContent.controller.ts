import { Request, Response } from 'express';
import siteService from '../services/site.service';
import logger from '../utils/logger';
import { AppError } from '../types/common';

export const getAllContents = async (req: Request, res: Response) => {
  try {
    const { section, isActive } = req.query;
    const contents = await siteService.listContents(
      section as string,
      isActive !== undefined ? isActive === 'true' : undefined
    );
    res.status(200).json({ success: true, count: contents.length, contents });
  } catch (error: unknown) {
    logger.error('İçerik listeleme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const getContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const content = await siteService.getContentBySection(section);

    if (!content) {
      return res.status(200).json({ success: true, message: 'İçerik bulunamadı', content: null });
    }

    res.status(200).json({ success: true, content });
  } catch (error: unknown) {
    logger.error('İçerik detayları hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { section, content, order, isActive } = req.body;
    if (!section || !content) return res.status(400).json({ success: false, message: 'Bölüm ve içerik gereklidir' });

    // Reusing createOrUpdate logic which was split in old controller but logically similar
    const result = await siteService.createOrUpdateContent(section, content, order, isActive);
    res.status(200).json({ success: true, content: result }); // Old controller returned 201 for new, 200 for update. Here 200 is safe.
  } catch (error: unknown) {
    logger.error('İçerik oluşturma hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await siteService.updateContentById(id, req.body);
    res.status(200).json({ success: true, content: result });
  } catch (error: unknown) {
    logger.error('İçerik güncelleme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const updateContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { content, order, isActive } = req.body;
    const result = await siteService.createOrUpdateContent(section, content, order, isActive);
    res.status(200).json({ success: true, content: result });
  } catch (error: unknown) {
    logger.error('İçerik güncelleme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await siteService.deleteContent(id);
    res.status(200).json({ success: true, message: 'Silindi' });
  } catch (error: unknown) {
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};
