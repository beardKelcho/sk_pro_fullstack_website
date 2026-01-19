import { Request, Response } from 'express';
import { AppError } from '../types/common';
import { QRCode, QRScanHistory, Equipment, Project } from '../models';
import logger from '../utils/logger';
import { generateQRCodeContent, generateQRCodeImage, parseQRCodeContent } from '../utils/qrGenerator';

// Tüm QR kodları listele
export const getAllQRCodes = async (req: Request, res: Response) => {
  try {
    const { type, isActive, relatedType, page = 1, limit = 10 } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (relatedType) filters.relatedType = relatedType;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const qrCodes = await QRCode.find(filters)
      .populate('createdBy', 'name email')
      .populate('lastScannedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await QRCode.countDocuments(filters);
    
    res.status(200).json({
      success: true,
      qrCodes,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    logger.error('QR kod listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kodlar yüklenirken bir hata oluştu',
    });
  }
};

// QR kod oluştur
export const createQRCode = async (req: Request, res: Response) => {
  try {
    const { type, relatedId, relatedType, title, description } = req.body;
    const userId = req.user?._id;
    
    if (!type || !relatedId || !relatedType) {
      return res.status(400).json({
        success: false,
        message: 'QR kod tipi, ilişkili ID ve tip gereklidir',
      });
    }
    
    // İlişkili kaydın var olup olmadığını kontrol et
    let relatedExists = false;
    if (relatedType === 'Equipment') {
      relatedExists = !!(await Equipment.findById(relatedId));
    } else if (relatedType === 'Project') {
      relatedExists = !!(await Project.findById(relatedId));
    }
    
    if (!relatedExists) {
      return res.status(404).json({
        success: false,
        message: 'İlişkili kayıt bulunamadı',
      });
    }
    
    // QR kod içeriği oluştur
    const code = generateQRCodeContent(type, relatedId);
    
    // QR kod oluştur
    const qrCode = new QRCode({
      code,
      type,
      relatedId,
      relatedType,
      title,
      description,
      createdBy: userId,
      isActive: true,
    });
    
    await qrCode.save();
    
    // QR kod görseli oluştur
    const qrImage = await generateQRCodeImage(code);
    
    res.status(201).json({
      success: true,
      qrCode,
      qrImage, // Base64 PNG
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    const mongooseError = error as { code?: number | string };
    logger.error('QR kod oluşturma hatası:', error);
    
    if (mongooseError?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Bu QR kod zaten mevcut',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'QR kod oluşturulurken bir hata oluştu',
    });
  }
};

// QR kod tarama
export const scanQRCode = async (req: Request, res: Response) => {
  try {
    const { qrContent, action, relatedItem, relatedItemType, notes, location } = req.body;
    const userId = req.user?._id;
    
    if (!qrContent) {
      return res.status(400).json({
        success: false,
        message: 'QR kod içeriği gereklidir',
      });
    }
    
    // QR kod içeriğini parse et
    const parsed = parseQRCodeContent(qrContent);
    if (!parsed.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz QR kod formatı',
      });
    }
    
    // QR kod kaydını bul
    const qrCode = await QRCode.findOne({ code: qrContent });
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı',
      });
    }
    
    if (!qrCode.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Bu QR kod aktif değil',
      });
    }
    
    // Tarama sayısını artır ve son tarama zamanını güncelle
    qrCode.scanCount += 1;
    qrCode.lastScannedAt = new Date();
    await qrCode.save();
    
    // İlişkili kaydı getir
    let relatedItemData = null;
    if (qrCode.relatedType === 'Equipment') {
      relatedItemData = await Equipment.findById(qrCode.relatedId);
    } else if (qrCode.relatedType === 'Project') {
      relatedItemData = await Project.findById(qrCode.relatedId);
    }
    
    // Tarama geçmişine ekle
    const scanHistory = new QRScanHistory({
      qrCode: qrCode._id,
      scannedBy: userId,
      action: action || 'VIEW',
      relatedItem,
      relatedItemType,
      notes,
      location,
    });
    await scanHistory.save();
    
    res.status(200).json({
      success: true,
      qrCode,
      relatedItem: relatedItemData,
      scanHistory,
    });
  } catch (error) {
    logger.error('QR kod tarama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod taranırken bir hata oluştu',
    });
  }
};

// QR kod detayı
export const getQRCodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const qrCode = await QRCode.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastScannedBy', 'name email');
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı',
      });
    }
    
    // İlişkili kaydı getir
    let relatedItem = null;
    if (qrCode.relatedType === 'Equipment') {
      relatedItem = await Equipment.findById(qrCode.relatedId);
    } else if (qrCode.relatedType === 'Project') {
      relatedItem = await Project.findById(qrCode.relatedId);
    }
    
    // Tarama geçmişi
    const scanHistory = await QRScanHistory.find({ qrCode: qrCode._id })
      .populate('scannedBy', 'name email')
      .sort({ scannedAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      qrCode,
      relatedItem,
      scanHistory,
    });
  } catch (error) {
    logger.error('QR kod detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod yüklenirken bir hata oluştu',
    });
  }
};

// QR kod güncelle
export const updateQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    
    const qrCode = await QRCode.findById(id);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı',
      });
    }
    
    if (title !== undefined) qrCode.title = title;
    if (description !== undefined) qrCode.description = description;
    if (isActive !== undefined) qrCode.isActive = isActive;
    
    await qrCode.save();
    
    res.status(200).json({
      success: true,
      qrCode,
    });
  } catch (error) {
    logger.error('QR kod güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod güncellenirken bir hata oluştu',
    });
  }
};

// QR kod sil
export const deleteQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const qrCode = await QRCode.findById(id);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı',
      });
    }
    
    // Tarama geçmişini de sil
    await QRScanHistory.deleteMany({ qrCode: qrCode._id });
    
    await QRCode.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'QR kod başarıyla silindi',
    });
  } catch (error) {
    logger.error('QR kod silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod silinirken bir hata oluştu',
    });
  }
};

// QR kod görseli oluştur (yeniden)
export const regenerateQRImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const qrCode = await QRCode.findById(id);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı',
      });
    }
    
    const qrImage = await generateQRCodeImage(qrCode.code);
    
    res.status(200).json({
      success: true,
      qrImage,
    });
  } catch (error) {
    logger.error('QR kod görseli oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod görseli oluşturulurken bir hata oluştu',
    });
  }
};

