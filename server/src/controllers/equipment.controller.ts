import { Request, Response } from 'express';
import { Equipment } from '../models';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Tüm ekipmanları listele
export const getAllEquipment = async (req: Request, res: Response) => {
  try {
    // Query parametreleri
    const { type, status, search, sort = 'name', page = 1, limit = 10 } = req.query;
    
    // Filtreleme koşulları
    const filters: any = {};
    
    if (type) {
      filters.type = type;
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sayfalama
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Sıralama
    const sortField = (sort as string).startsWith('-') 
      ? (sort as string).substring(1) 
      : (sort as string);
    const sortOrder = (sort as string).startsWith('-') ? -1 : 1;
    
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;
    
    // Ekipmanları sorgula
    const [equipment, total] = await Promise.all([
      Equipment.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('responsibleUser', 'name email'),
        
      Equipment.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      equipment,
    });
  } catch (error) {
    logger.error('Ekipmanları listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipmanlar listelenirken bir hata oluştu',
    });
  }
};

// Tek bir ekipmanın detaylarını getir
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }
    
    const equipment = await Equipment.findById(id)
      .populate('responsibleUser', 'name email')
      .populate({
        path: 'maintenances',
        options: { sort: { startDate: -1 } }
      });
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      equipment,
    });
  } catch (error) {
    logger.error('Ekipman detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni ekipman oluştur
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name, type, model, serialNumber, purchaseDate, status, location, notes, responsibleUser } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Ekipman adı ve tipi gereklidir',
      });
    }
    
    // Ekipmanı oluştur
    const equipment = await Equipment.create({
      name,
      type,
      model,
      serialNumber,
      purchaseDate,
      status: status || 'AVAILABLE',
      location,
      notes,
      responsibleUser,
    });
    
    res.status(201).json({
      success: true,
      equipment,
    });
  } catch (error) {
    logger.error('Ekipman oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman oluşturulurken bir hata oluştu',
    });
  }
};

// Ekipman güncelle
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, model, serialNumber, purchaseDate, status, location, notes, responsibleUser } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }
    
    // Ekipmanı güncelle
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      id,
      {
        name,
        type,
        model,
        serialNumber,
        purchaseDate,
        status,
        location,
        notes,
        responsibleUser,
      },
      { new: true, runValidators: true }
    ).populate('responsibleUser', 'name email');
    
    if (!updatedEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      equipment: updatedEquipment,
    });
  } catch (error) {
    logger.error('Ekipman güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman güncellenirken bir hata oluştu',
    });
  }
};

// Ekipman sil
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }
    
    const equipment = await Equipment.findById(id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }
    
    // Ekipman kullanımda mı kontrol et
    if (equipment.status === 'IN_USE') {
      return res.status(400).json({
        success: false,
        message: 'Kullanımda olan ekipman silinemez',
      });
    }
    
    await equipment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Ekipman başarıyla silindi',
    });
  } catch (error) {
    logger.error('Ekipman silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman silinirken bir hata oluştu',
    });
  }
}; 