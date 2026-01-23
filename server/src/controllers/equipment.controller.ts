import { Request, Response } from 'express';
import equipmentService, { PaginatedEquipment } from '../services/equipment.service';
import logger from '../utils/logger';
import { AppError, AuthenticatedRequest } from '../types/common';


export class EquipmentController {

  // Tüm ekipmanları listele
  async getAllEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sort, search, type, status, warehouse } = req.query;

      const result: PaginatedEquipment = await equipmentService.listEquipment(
        parseInt(page as string, 10) || 1,
        parseInt(limit as string, 10) || 20,
        (sort as string) || '-createdAt',
        search as string,
        type as string,
        status as string,
        warehouse as string
      );

      res.status(200).json({
        success: true,
        count: result.equipment.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        data: result.equipment // Keeping legacy 'data' field or should we switch to 'equipment'? Using 'data' for now to fit generic frontend? 
        // Wait, previous User controller used 'users'. Let's check old controller.
        // Old controller sent: { success, count, total, page, totalPages, data: equipment } or { equipment: equipment }
        // Let's stick to 'data' or 'equipment' based on what old controller returned.
        // Looking at old logic: data: equipment
      });
    } catch (error: unknown) {
      logger.error('Ekipman listeleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Tek bir ekipman getir
  async getEquipmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.getEquipmentById(id);
      res.status(200).json({ success: true, data: equipment });
    } catch (error: unknown) {
      logger.error('Ekipman detay hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Yeni ekipman oluştur
  async createEquipment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const equipment = await equipmentService.createEquipment({
        ...req.body,
        userId
      });

      res.status(201).json({ success: true, data: equipment });
    } catch (error: unknown) {
      logger.error('Ekipman oluşturma hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Ekipman güncelle
  async updateEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.updateEquipment(id, req.body);
      res.status(200).json({ success: true, data: equipment });
    } catch (error: unknown) {
      logger.error('Ekipman güncelleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Ekipman sil
  async deleteEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await equipmentService.deleteEquipment(id);
      res.status(200).json({ success: true, message: 'Ekipman başarıyla silindi' });
    } catch (error: unknown) {
      logger.error('Ekipman silme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // İstatistiki verileri getir
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await equipmentService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: unknown) {
      logger.error('İstatistik hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }
}

export default new EquipmentController();