import { Request, Response } from 'express';
import { Maintenance, Equipment } from '../models';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Tüm bakımları listele
export const getAllMaintenances = async (req: Request, res: Response) => {
  try {
    const { status, type, equipment, sort = '-scheduledDate', page = 1, limit = 10 } = req.query;
    
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (type) {
      filters.type = type;
    }
    
    if (equipment) {
      filters.equipment = equipment;
    }
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    const sortField = (sort as string).startsWith('-') 
      ? (sort as string).substring(1) 
      : (sort as string);
    const sortOrder = (sort as string).startsWith('-') ? -1 : 1;
    
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;
    
    const [maintenances, total] = await Promise.all([
      Maintenance.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('equipment', 'name type model')
        .populate('assignedTo', 'name email'),
      Maintenance.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: maintenances.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      maintenances,
    });
  } catch (error) {
    logger.error('Bakımları listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakımlar listelenirken bir hata oluştu',
    });
  }
};

// Tek bir bakımın detaylarını getir
export const getMaintenanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz bakım ID',
      });
    }
    
    const maintenance = await Maintenance.findById(id)
      .populate('equipment', 'name type model serialNumber status')
      .populate('assignedTo', 'name email role');
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Bakım bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    logger.error('Bakım detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni bakım oluştur
export const createMaintenance = async (req: Request, res: Response) => {
  try {
    const { equipment, type, description, scheduledDate, status, assignedTo, cost, notes } = req.body;
    
    if (!equipment || !type || !description || !scheduledDate || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Ekipman, tip, açıklama, planlanan tarih ve atanan kişi gereklidir',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(equipment)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID',
      });
    }
    
    const maintenance = await Maintenance.create({
      equipment,
      type,
      description,
      scheduledDate,
      status: status || 'SCHEDULED',
      assignedTo,
      cost,
      notes,
    });
    
    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('equipment', 'name type model')
      .populate('assignedTo', 'name email');
    
    res.status(201).json({
      success: true,
      maintenance: populatedMaintenance,
    });
  } catch (error) {
    logger.error('Bakım oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım oluşturulurken bir hata oluştu',
    });
  }
};

// Bakım güncelle
export const updateMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { equipment, type, description, scheduledDate, completedDate, status, assignedTo, cost, notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz bakım ID',
      });
    }
    
    const updateData: any = {};
    if (equipment) updateData.equipment = equipment;
    if (type) updateData.type = type;
    if (description) updateData.description = description;
    if (scheduledDate) updateData.scheduledDate = scheduledDate;
    if (completedDate) updateData.completedDate = completedDate;
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (cost !== undefined) updateData.cost = cost;
    if (notes !== undefined) updateData.notes = notes;
    
    // Eğer status COMPLETED ise ve completedDate yoksa, şimdiki zamanı ayarla
    if (status === 'COMPLETED' && !completedDate) {
      updateData.completedDate = new Date();
    }
    
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('equipment', 'name type model')
      .populate('assignedTo', 'name email');
    
    if (!updatedMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Bakım bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      maintenance: updatedMaintenance,
    });
  } catch (error) {
    logger.error('Bakım güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım güncellenirken bir hata oluştu',
    });
  }
};

// Bakım sil
export const deleteMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz bakım ID',
      });
    }
    
    const maintenance = await Maintenance.findById(id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Bakım bulunamadı',
      });
    }
    
    if (maintenance.status === 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Devam eden bakım silinemez',
      });
    }
    
    await maintenance.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Bakım başarıyla silindi',
    });
  } catch (error) {
    logger.error('Bakım silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım silinirken bir hata oluştu',
    });
  }
};

