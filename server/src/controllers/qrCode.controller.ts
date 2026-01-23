import { Request, Response } from 'express';
import qrCodeService, { CreateQRCodeData } from '../services/qrCode.service';
import logger from '../utils/logger';
import { AppError, AuthenticatedRequest } from '../types/common';

export const getAllQRCodes = async (req: Request, res: Response) => {
  try {
    const { type, isActive, relatedType, page, limit } = req.query;

    const result = await qrCodeService.listQRCodes(
      parseInt(page as string, 10) || 1,
      parseInt(limit as string, 10) || 10,
      type as string,
      isActive !== undefined ? isActive === 'true' : undefined,
      relatedType as string
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: unknown) {
    logger.error('QR kod listeleme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const createQRCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    // Cast strict type
    const createData: CreateQRCodeData = {
      ...req.body,
      userId
    };

    const result = await qrCodeService.createQRCode(createData);

    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error: unknown) {
    // Handle duplicate key error manually if needed, or let global handler catch it
    // Service doesn't check for unique code pre-emptively for perf, relies on index.
    // If it's a mongo error:
    const mongooseError = error as { code?: number };
    if (mongooseError.code === 11000) {
      return res.status(409).json({ success: false, message: 'Bu QR kod zaten mevcut' });
    }

    logger.error('QR kod oluşturma hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const scanQRCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;

    const result = await qrCodeService.scanQRCode({
      ...req.body,
      userId
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: unknown) {
    logger.error('QR kod tarama hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const getQRCodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await qrCodeService.getQRCodeById(id);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: unknown) {
    logger.error('QR kod detay hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const updateQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeService.updateQRCode(id, req.body);
    res.status(200).json({ success: true, qrCode });
  } catch (error: unknown) {
    logger.error('QR kod güncelleme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const deleteQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await qrCodeService.deleteQRCode(id);
    res.status(200).json({ success: true, message: 'QR kod başarıyla silindi' });
  } catch (error: unknown) {
    logger.error('QR kod silme hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};

export const regenerateQRImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrImage = await qrCodeService.regenerateQRImage(id);
    res.status(200).json({ success: true, qrImage });
  } catch (error: unknown) {
    logger.error('QR kod görseli oluşturma hatası:', error);
    const appError = error instanceof AppError ? error : new AppError('Hata oluştu');
    res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
  }
};
